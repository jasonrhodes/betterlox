import { useState, useEffect } from "react";
import { DEFAULT_USER_SETTINGS } from "@rhodesjason/loxdb/dist/common/constants";
import { AllStatsType, StatMode, PersonStats, UserStatsResponse, PeopleStatsType } from "@rhodesjason/loxdb/dist/common/types/api";
import { Collection } from "@rhodesjason/loxdb/dist/db/entities";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { convertFiltersToQueryString } from "@rhodesjason/loxdb/dist/lib/convertFiltersToQueryString";
import { CollectionsStatsPanel } from "./CollectionStatsPanel";
import { isPeople, isCollections } from "./helpers";
import { PeopleStatsPanel } from "./PeopleStatsPanel";

interface StatsTabOptions {
  type: AllStatsType;
  mode: StatMode;
}

export function StatsTab({ type, mode }: StatsTabOptions) {
  const [results, setResults] = useState<(PersonStats[] | Collection[])>([]);
  const { globalFilters, setGlobalFilters } = useGlobalFilters();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      // Hard-code allGenres to true, not implementing "ANY" for genres at this time
      globalFilters.allGenres = true;
      const filtersQueryString = convertFiltersToQueryString(globalFilters);
      const { statsMinWatched, statsMinCastOrder } = user.settings || DEFAULT_USER_SETTINGS;
      const { data } = await callApi<UserStatsResponse>(`/api/users/${user.id}/stats?type=${type}&mode=${mode}&minCastOrder=${statsMinCastOrder}&minWatched=${statsMinWatched}&${filtersQueryString}`);
      setResults(data.stats);
      setIsLoading(false);
    }
    retrieve();
  }, [type, user, mode, globalFilters]);
  
  if (user && isPeople(results, type)) {
    return (
      <PeopleStatsPanel 
        people={results} 
        type={type as PeopleStatsType} 
        mode={mode}
        isLoading={isLoading}
      />
    );
  }

  if (user && isCollections(results, type)) {
    return <CollectionsStatsPanel collections={results} mode={mode} isLoading={isLoading} />
  }

  return null;
}