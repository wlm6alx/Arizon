import { useState, useCallback } from 'react';
import { ApiError, apiClient, ApiRequestOptions } from '@/lib/api';

type UseApiOptions<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
};

export function useApi<T = any>(
  endpoint: string,
  { onSuccess, onError }: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (options: ApiRequestOptions = {}) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await apiClient<T>(endpoint, options);
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
      }
    },
    [endpoint, onError, onSuccess]
  );

  return {
    data,
    error,
    isLoading,
    execute,
  };
}
