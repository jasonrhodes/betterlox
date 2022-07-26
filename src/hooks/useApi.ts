/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

interface ApiResponse<T> {
  response?: T;
  errorStatus?: number;
}

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [results, setResults] = useState<ApiResponse<T>>({});
  
  useEffect(() => {
    async function retrieve() {
      const result = await fetch(endpoint);
      if (result.status !== 200) {
        setResults({
          errorStatus: result.status
        })
      }
      const json = await result.json() as T;
      setResults({ response: json });
    }

    retrieve();
  }, dependencies);

  return results;
}