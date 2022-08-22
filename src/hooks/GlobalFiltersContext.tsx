import React, { useContext, useState } from 'react';
import { RatingsFilters, StatsFilters } from '../common/types/api';

const GlobalFiltersContext = React.createContext<{ 
  ratingsFilters: RatingsFilters;
  setRatingsFilters: (f: RatingsFilters) => void;
  statsFilters: StatsFilters;
  setStatsFilters: (f: StatsFilters) => void;
}>({
  ratingsFilters: {},
  setRatingsFilters: () => null,
  statsFilters: {},
  setStatsFilters: () => null
});

const GlobalFiltersContextConsumer = GlobalFiltersContext.Consumer;

const GlobalFiltersContextProvider: React.FC<{ 
  initialRatingsFilters?: RatingsFilters;
  initialStatsFilters?: StatsFilters; 
}> = ({ 
  children,
  initialRatingsFilters,
  initialStatsFilters
}) => {
  const [ratingsFilters, setRatingsFilters] = useState<RatingsFilters>(initialRatingsFilters || {});
  const [statsFilters, setStatsFilters] = useState<StatsFilters>(initialStatsFilters || {});

  return (
    <GlobalFiltersContext.Provider value={{ 
      ratingsFilters,
      setRatingsFilters,
      statsFilters,
      setStatsFilters
    }}>
      {children}
    </GlobalFiltersContext.Provider>
  )
};

function useGlobalFilters() {
  return useContext(GlobalFiltersContext);
}

function useRatingsFilters(): [RatingsFilters, (f: RatingsFilters) => void] {
  const { ratingsFilters, setRatingsFilters } = useGlobalFilters();
  return [ratingsFilters, setRatingsFilters];
}

function useStatsFilters(): [StatsFilters, (f: StatsFilters) => void] {
  const { statsFilters, setStatsFilters } = useGlobalFilters();
  return [statsFilters, setStatsFilters];
}

export {
  GlobalFiltersContext,
  GlobalFiltersContextConsumer,
  GlobalFiltersContextProvider,
  useGlobalFilters,
  useRatingsFilters,
  useStatsFilters
};