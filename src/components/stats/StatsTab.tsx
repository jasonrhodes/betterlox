import { useState, useEffect } from "react";
import { AllStatsType, StatMode, PersonStats, UserStatsResponse, PeopleStatsType } from "../../common/types/api";
import { Collection } from "../../db/entities";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { convertFiltersToQueryString } from "../../lib/convertFiltersToQueryString";
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
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      // Hard-code allGenres to true, not implementing "ANY" for genres at this time
      globalFilters.allGenres = true;
      const filtersQueryString = convertFiltersToQueryString(globalFilters);
      const { statsMinWatched, statsMinCastOrder } = user.settings;
      const { data } = await callApi<UserStatsResponse>(`/api/users/${user.id}/stats?type=${type}&mode=${mode}&minCastOrder=${statsMinCastOrder}&minWatched=${statsMinWatched}&${filtersQueryString}`);
      setResults(data.stats);
    }
    retrieve();
  }, [type, user, mode, globalFilters]);
  
  if (user && isPeople(results, type)) {
    return (
      <PeopleStatsPanel 
        people={results} 
        type={type as PeopleStatsType} 
        mode={mode} 
      />
    );
  }

  if (user && isCollections(results, type)) {
    return <CollectionsStatsPanel collections={results} mode={mode} />
  }

  return null;
}