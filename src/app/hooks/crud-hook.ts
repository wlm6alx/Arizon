"use client";

import api from "@/lib/api";
import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";

/**
 * Pagination information from API response
 */
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/**
 * Type guard to check if response has pagination structure
 */
const isPaginatedResponse = (response: unknown): response is {
  success: boolean;
  data: Record<string, unknown>;
} => {
  return (
    response !== null &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response &&
    typeof (response as Record<string, unknown>).data === 'object'
  );
};

/**
 * Options for CRUD hook caching behavior.
 */
interface CrudHookOptions {
  /** Enable SWR caching for `getAll` requests (default: false) */
  cache?: boolean;
  /** Optional SWR configuration object */
  swrConfig?: object;
  /** Data key in paginated response (default: endpoint name) */
  dataKey?: string;
}

/**
 * Represents loading/error state for a specific CRUD action.
 */
interface ActionState {
  loading: boolean;
  error: string | null;
}

/**
 * Generic CRUD hook for any API endpoint.
 * Supports optional caching and per-action state tracking.
 *
 * @template T Type of entity for this endpoint
 * @param endpoint API endpoint (relative to base URL)
 * @param options Optional configuration (caching, SWR config)
 */
export function useCrudHook<T>(
  endpoint: string,
  options: CrudHookOptions = {}
) {
  const { cache = false, swrConfig = {}, dataKey } = options;
  
  // Determine the data key for paginated responses
  const getDataKey = () => {
    if (dataKey) return dataKey;
    // Convert endpoint to data key (e.g., "products" -> "products", "users" -> "users")
    return endpoint.split('/').pop() || endpoint;
  };

  // ------------------- Per-action states -------------------
  const [createState, setCreateState] = useState<ActionState>({ loading: false, error: null });
  const [updateState, setUpdateState] = useState<ActionState>({ loading: false, error: null });
  const [deleteState, setDeleteState] = useState<ActionState>({ loading: false, error: null });

  /**
   * Extract data from API response, handling both paginated and non-paginated responses
   * @param responseData Raw response data from API
   * @param dataKey Key to extract data from (e.g., "products", "users")
   */
  const extractDataFromResponse = <T>(responseData: unknown, dataKey: string): T[] => {
    // Handle paginated response structure
    if (isPaginatedResponse(responseData)) {
      const data = responseData.data[dataKey];
      if (Array.isArray(data)) {
        return data as T[];
      }
    }
    
    // Handle direct array response
    if (Array.isArray(responseData)) {
      return responseData as T[];
    }
    
    // Handle direct data object
    if (
      responseData && 
      typeof responseData === 'object' && 
      'data' in responseData &&
      Array.isArray((responseData as Record<string, unknown>).data)
    ) {
      return (responseData as Record<string, unknown>).data as T[];
    }
    
    // Fallback: return empty array
    console.warn(`Could not extract data for key "${dataKey}" from response:`, responseData);
    return [];
  };

  /**
   * Handle and log errors for actions
   * @param context Context string (e.g., "getAll users")
   * @param error Error object
   */
  const handleError = (context: string, error: unknown): string => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error during ${context}:`, error);
    return `${context}: ${message}`;
  };

  // ------------------- CACHED getAll -------------------
  const { data: cachedAll, error: allError, mutate: mutateAll } = useSWR<T[]>(
    cache ? endpoint : null,
    async () => {
      const res = await api.get(endpoint);
      return extractDataFromResponse<T>(res.data, getDataKey());
    },
    swrConfig
  );

  /**
   * Fetch all items, optionally with query filters.
   * Uses SWR caching only for unfiltered requests.
   * @param filters Optional query params
   */
  const getAll = async (filters?: Record<string, string>): Promise<T[]> => {
    if (!filters && cache) {
      if (cachedAll) return cachedAll;
      if (allError) throw new Error(`Failed to fetch ${endpoint}`);
      return [];
    }
    try {
      const res = await api.get(endpoint, { params: filters });
      return extractDataFromResponse<T>(res.data, getDataKey());
    } catch (error) {
      throw new Error(handleError(`getAll ${endpoint}`, error));
    }
  };

  /**
   * Fetch all items with pagination information.
   * @param filters Optional query params including pagination
   */
  const getAllWithPagination = async (filters?: Record<string, string>): Promise<{
    data: T[];
    pagination: PaginationInfo;
  }> => {
    try {
      const res = await api.get(endpoint, { params: filters });
      
      // Handle paginated response structure
      if (res.data?.success && res.data?.data) {
        const dataKey = getDataKey();
        return {
          data: res.data.data[dataKey] || [],
          pagination: res.data.data.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
        };
      }
      
      // Fallback for non-paginated responses
      return {
        data: extractDataFromResponse<T>(res.data, getDataKey()),
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      };
    } catch (error) {
      throw new Error(handleError(`getAllWithPagination ${endpoint}`, error));
    }
  };

  /**
   * Fetch a single item by ID.
   * @param id Item identifier
   */
  const getOne = async (id: number | string): Promise<T | null> => {
    try {
      const res = await api.get(`${endpoint}/${id}`);
      return res.data as T;
    } catch (error) {
      throw new Error(handleError(`getOne ${endpoint}`, error));
    }
  };

  /**
   * Create a new item.
   * @param item Partial entity to create
   */
  const create = async (item: Partial<T>): Promise<T | null> => {
    setCreateState({ loading: true, error: null });
    try {
      const res = await api.post(endpoint, item);
      if (cache) globalMutate(endpoint); // refresh cache
      return res.data as T;
    } catch (error) {
      setCreateState({ loading: false, error: handleError(`create ${endpoint}`, error) });
      return null;
    } finally {
      setCreateState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Update an existing item by ID.
   * @param id Item identifier
   * @param updates Partial entity updates
   */
  const update = async (id: number | string, updates: Partial<T>): Promise<T | null> => {
    setUpdateState({ loading: true, error: null });
    try {
      const res = await api.put(`${endpoint}/${id}`, updates);
      if (cache) {
        globalMutate(endpoint);
        globalMutate(`${endpoint}/${id}`);
      }
      return res.data as T;
    } catch (error) {
      setUpdateState({ loading: false, error: handleError(`update ${endpoint}`, error) });
      return null;
    } finally {
      setUpdateState(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Delete an item by ID.
   * @param id Item identifier
   */
  const remove = async (id: number | string): Promise<boolean> => {
    setDeleteState({ loading: true, error: null });
    try {
      await api.delete(`${endpoint}/${id}`);
      if (cache) {
        globalMutate(endpoint);
        globalMutate(`${endpoint}/${id}`);
      }
      return true;
    } catch (error) {
      setDeleteState({ loading: false, error: handleError(`delete ${endpoint}`, error) });
      return false;
    } finally {
      setDeleteState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    // CRUD methods
    getAll,
    getAllWithPagination,
    getOne,
    create,
    update,
    remove,

    // Action states
    createState,
    updateState,
    deleteState,
    allError,

    // SWR cache utilities
    mutateAll,
  };
}
