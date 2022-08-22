import { useState, useEffect } from "react";
import { AllStatsType, StatMode, PersonStats, UserStatsResponse, PeopleStatsType, StatsFilters } from "../../common/types/api";
import { Collection } from "../../db/entities";
import { useStatsFilters } from "../../hooks/GlobalFiltersContext";
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
  const [statsFilters, setStatsFilters] = useStatsFilters();
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      // Hard-code allGenres to true, not implementing "ANY" for genres at this time
      statsFilters.allGenres = true;
      const filtersQueryString = convertFiltersToQueryString<StatsFilters>(statsFilters);
      const { statsMinWatched, statsMinCastOrder } = user.settings;
      const { data } = await callApi<UserStatsResponse>(`/api/users/${user.id}/stats?type=${type}&mode=${mode}&minCastOrder=${statsMinCastOrder}&minWatched=${statsMinWatched}&${filtersQueryString}`);
      setResults(data.stats);
    }
    retrieve();
  }, [type, user, mode, statsFilters]);
  
  if (user && isPeople(results, type)) {
    return (
      <PeopleStatsPanel 
        statsFilters={statsFilters} 
        setStatsFilters={setStatsFilters} 
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