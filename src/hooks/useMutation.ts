import { useState, useCallback } from 'react';
import { ApiError, apiClient, ApiRequestOptions } from '@/lib/api';

type UseMutationOptions<T, V = any> = {
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: ApiError, variables: V) => void;
  onSettled?: (data: T | null, error: ApiError | null, variables: V) => void;
};

export function useMutation<T = any, V = any>(
  endpoint: string | ((variables: V) => string),
  options: UseMutationOptions<T, V> = {}
) {
  const { onSuccess, onError, onSettled } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(
    async (variables: V, config: Omit<ApiRequestOptions, 'body'> = {}) => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint;
        const result = await apiClient<T>(url, {
          ...config,
          method: config.method || 'POST',
          body: variables,
        });

        setData(result);
        setIsSuccess(true);
        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiError ? err : new ApiError('An error occurred', 500);
        setError(apiError);
        onError?.(apiError, variables);
        onSettled?.(null, apiError, variables);
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, onError, onSuccess, onSettled]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    mutate,
    reset,
  };
}
