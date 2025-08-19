import { getSession } from 'next-auth/react';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions extends RequestInit {
  method?: RequestMethod;
  body?: any;
  headers?: HeadersInit;
}

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  { body, headers: customHeaders, ...customConfig }: ApiRequestOptions = {}
): Promise<T> {
  const session = await getSession();
  const token = session?.accessToken;

  const config: RequestInit = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': body ? 'application/json' : '',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...customHeaders,
    },
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`/api/${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'Something went wrong',
      response.status,
      data
    );
  }

  return data;
}

// Helper methods for specific HTTP methods
export const apiGet = <T = any>(endpoint: string, config: Omit<ApiRequestOptions, 'method'> = {}) =>
  apiClient<T>(endpoint, { ...config, method: 'GET' });

export const apiPost = <T = any>(
  endpoint: string,
  data: any,
  config: Omit<ApiRequestOptions, 'method' | 'body'> = {}
) => apiClient<T>(endpoint, { ...config, method: 'POST', body: data });

export const apiPut = <T = any>(
  endpoint: string,
  data: any,
  config: Omit<ApiRequestOptions, 'method' | 'body'> = {}
) => apiClient<T>(endpoint, { ...config, method: 'PUT', body: data });

export const apiPatch = <T = any>(
  endpoint: string,
  data: any,
  config: Omit<ApiRequestOptions, 'method' | 'body'> = {}
) => apiClient<T>(endpoint, { ...config, method: 'PATCH', body: data });

export const apiDelete = <T = any>(
  endpoint: string,
  config: Omit<ApiRequestOptions, 'method'> = {}
) => apiClient<T>(endpoint, { ...config, method: 'DELETE' });
