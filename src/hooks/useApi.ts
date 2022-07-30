/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";

export async function callApi<T>(endpoint: string) {
  const response = await axios.get<T>(endpoint);
  if (response.status !== 200) {
    return {
      success: false,
      ...response
    };
  }

  return { success: true, ...response };
}

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [results, setResults] = useState<AxiosResponse<T> | {}>({});
  
  useEffect(() => {
    async function retrieve() {
      const results = await callApi<T>(endpoint);
      setResults(results);
    }

    retrieve();
  }, dependencies);

  return results;
}