import { useState, useEffect, useCallback } from 'react';
import { ApiError, apiClient, ApiRequestOptions } from '@/lib/api';

type UseQueryOptions<T> = {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  refetchInterval?: number | null;
};

export function useQuery<T = any>(
  endpoint: string,
  options: UseQueryOptions<T> = {}
) {
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchInterval = null,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = useCallback(
    async (config: ApiRequestOptions = {}) => {
      if (!enabled) return;

      setIsFetching(true);
      setError(null);

      try {
        const result = await apiClient<T>(endpoint, config);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiError ? err : new ApiError('An error occurred', 500);
        setError(apiError);
        onError?.(apiError);
        throw apiError;
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [endpoint, enabled, onError, onSuccess]
  );

  useEffect(() => {
    if (enabled) {
      setIsLoading(true);
      fetchData();
    }
  }, [enabled, fetchData]);

  useEffect(() => {
    if (!refetchInterval) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [refetchInterval, fetchData]);

  const refetch = useCallback(
    (config: ApiRequestOptions = {}) => {
      return fetchData(config);
    },
    [fetchData]
  );

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  };
}
