import { useState } from "react";
import { AxiosError } from "axios";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      const errorMessage = error.response?.data?.error || "Error desconocido";
      setState({ data: null, loading: false, error: errorMessage });
      throw error;
    }
  };

  return {
    ...state,
    execute,
  };
};
