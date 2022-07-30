/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import axios, { AxiosResponse } from "axios";

export interface ExternalApiResponse<T = any, K = any> extends AxiosResponse<T, K> {
  success: boolean;
}

export async function callApi<T>(endpoint: string): Promise<ExternalApiResponse<T>> {
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
  const [results, setResults] = useState<ExternalApiResponse<T> | null>(null);
  
  useEffect(() => {
    async function retrieve() {
      const results = await callApi<T>(endpoint);
      setResults(results);
    }

    retrieve();
  }, dependencies);

  return results;
}