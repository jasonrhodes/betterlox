import React from 'react';
import { ImageConfig } from "../common/types/api";
import { useApi } from './useApi';

const ImageContext = React.createContext<ImageConfig & { errorStatus?: number }>({});
const ImageContextConsumer = ImageContext.Consumer;

const ImageContextProvider: React.FC<{}> = ({ children }) => {
  const { response = {}, errorStatus } = useApi<ImageConfig>('/api/image-config');
  return (
    <ImageContext.Provider value={{ errorStatus, ...response }}>
      {children}
    </ImageContext.Provider>
  )
}

export {
  ImageContext,
  ImageContextConsumer,
  ImageContextProvider
};