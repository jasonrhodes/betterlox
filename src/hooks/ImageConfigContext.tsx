import React from 'react';
import { ImageConfig } from "@rhodesjason/loxdb/dist/common/types/api";
import { useApi } from './useApi';

const ImageContext = React.createContext<ImageConfig & { errorStatus?: number }>({});
const ImageContextConsumer = ImageContext.Consumer;

const ImageContextProvider: React.FC<{}> = ({ children }) => {
  const response = useApi<ImageConfig>('/api/image-config');
  if (!response) {
    return null;
  }
  const { success, status } = response;
  const errorStatus = success ? undefined : status;
  return (
    <ImageContext.Provider value={{ errorStatus, ...response.data }}>
      {children}
    </ImageContext.Provider>
  )
}

export {
  ImageContext,
  ImageContextConsumer,
  ImageContextProvider
};