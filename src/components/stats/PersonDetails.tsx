import { Close } from "@mui/icons-material";
import { Drawer, Typography, capitalize } from "@mui/material";
import { useState, useEffect } from "react";
import { PeopleStatsType, PersonStats } from "../../common/types/api";
import { FilmEntry } from "../../db/entities";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { convertFiltersToQueryString } from "../../lib/convertFiltersToQueryString";
import { EntriesTable } from "../EntriesTable";

export function PersonDetails({ type, details, setDetails }: { type: PeopleStatsType; details: null | PersonStats; setDetails: (d: null | PersonStats) => void }) {
  const { user } = useCurrentUser();
  const [entries, setEntries] = useState<FilmEntry[]>([]);
  const { globalFilters } = useGlobalFilters();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (details === null || !user) {
      return;
    }
    async function retrieve(id: number) {
      if (!user) {
        return;
      }
      setIsLoading(true);
      const queries: string[] = [];
      if (type === "actors") {
        queries.push(`minCastOrder=${user.settings?.statsMinCastOrder}`);
      }
      queries.push(convertFiltersToQueryString({ ...globalFilters, [type]: [id] }));
      const url = `/api/users/${user.id}/entries?${queries.join('&')}`;
      const response = await callApi<{ entries: FilmEntry[] }>(url);

      // since the query on the back end can't perform multiple WHERE conditions
      // on a single "movie.genres" field, we exclude movies that contain any of
      // the excluded genres in JS after we've retrieved the list of movies
      // ... this is a TypeORM find options limitation for now
      const { excludedGenres = [] } = globalFilters;
      const entries = excludedGenres.length > 0
        ? response.data.entries.filter((entry) => {
          return excludedGenres.every((eg) => !entry.movie.genres.includes(eg))
        })
        : response.data.entries;
      
      setEntries(entries);
      setIsLoading(false);
    }
    retrieve(details.id);
  }, [details, type, user, globalFilters]);

  if (details === null) {
    return null;
  } 
  return (
    <Drawer
      anchor="right"
      open={!(details === null)}
      onClose={() => setDetails(null)}
      PaperProps={{ sx: { width: 540, maxWidth: "100%", backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
    >
      <Typography sx={{ my: 2 }}>{capitalize(type)}{' > '}<b>{details.name}</b></Typography>
      <Close sx={{ cursor: "pointer", position: "absolute", top: 20, right: 20 }} onClick={() => setDetails(null) } />
      <EntriesTable
        entries={entries}
        isLoading={isLoading}
      />
    </Drawer>
  )
}