import { Close } from "@mui/icons-material";
import { Drawer, Typography, capitalize } from "@mui/material";
import { useState, useEffect } from "react";
import { PeopleStatsType, PersonStats, GlobalFilters } from "../../common/types/api";
import { Rating } from "../../db/entities";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { convertFiltersToQueryString } from "../../lib/convertFiltersToQueryString";
import { RatingsTable } from "../RatingsTable";

export function PersonDetails({ type, details, setDetails }: { type: PeopleStatsType; details: null | PersonStats; setDetails: (d: null | PersonStats) => void }) {
  const { user } = useCurrentUser();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const { globalFilters } = useGlobalFilters();

  useEffect(() => {
    if (details === null || !user) {
      return;
    }
    async function retrieve(id: number) {
      if (!user) {
        return;
      }
      let qs = convertFiltersToQueryString({ [type]: [id] });
      if (type === "actors") {
        qs += `&minCastOrder=${user.settings.statsMinCastOrder}`;
      }
      qs += convertFiltersToQueryString(globalFilters);
      const url = `/api/users/${user.id}/ratings?${qs}`;
      const response = await callApi<{ ratings: Rating[] }>(url);

      // since the query on the back end can't perform multiple WHERE conditions
      // on a single "movie.genres" field, we exclude movies that contain any of
      // the excluded genres in JS after we've retrieved the list of movies
      // ... this is a TypeORM find options limitation for now
      const { excludedGenres = [] } = globalFilters;
      const ratings = excludedGenres.length > 0
        ? response.data.ratings.filter((rating) => {
          return excludedGenres.every((eg) => !rating.movie.genres.includes(eg))
        })
        : response.data.ratings;
      
      setRatings(ratings);
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
      <RatingsTable
        ratings={ratings}
      />
    </Drawer>
  )
}