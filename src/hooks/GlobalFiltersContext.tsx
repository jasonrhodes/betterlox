import React, { useContext, useState } from 'react';
import { GlobalFilters } from '../common/types/api';

const GlobalFiltersContext = React.createContext<{ 
  globalFilters: GlobalFilters;
  setGlobalFilters: (f: GlobalFilters) => void;
}>({
  globalFilters: {},
  setGlobalFilters: () => null
});

const GlobalFiltersContextConsumer = GlobalFiltersContext.Consumer;

const GlobalFiltersContextProvider: React.FC<{ 
  initialGlobalFilters?: GlobalFilters;
}> = ({ 
  children,
  initialGlobalFilters
}) => {
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>(initialGlobalFilters || {});

  return (
    <GlobalFiltersContext.Provider value={{ 
      globalFilters,
      setGlobalFilters
    }}>
      {children}
    </GlobalFiltersContext.Provider>
  )
};

function useGlobalFilters() {
  return useContext(GlobalFiltersContext);
}

export {
  GlobalFiltersContext,
  GlobalFiltersContextConsumer,
  GlobalFiltersContextProvider,
  useGlobalFilters
};