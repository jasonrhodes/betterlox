import { Box, CircularProgress, Grid, LinearProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse, ListUserStats, UserListStatsApiResponse } from "../../common/types/api";
import { UserPublicSafe } from "../../common/types/db";
import { LetterboxdList } from "../../db/entities";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { AppLink } from "../AppLink";
import { ListProgressCircularChart } from "./ListProgressCircularChart";

export function MyTrackedLists() {
  const [lists, setLists] = useState<LetterboxdList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      const response = await callApi<LetterboxdListsForUserApiResponse>(`/api/users/${user.id}/lists/tracking`);
      if (response.data?.success && 'lists' in response.data) {
        setLists(response.data.lists);
      }
      setIsLoading(false);
    }
    retrieve();
  }, [user]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Grid container spacing={3}>
      {lists.map(list => (
        <Grid key={list.id} item>
          <ListStatsCard list={list} user={user} />
        </Grid>
      ))}
    </Grid>
  );
}

function ListStatsCard({ list, user }: { list: LetterboxdList; user: UserPublicSafe; }) {
  const [stats, setStats] = useState<ListUserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function retrieve() {
      setIsLoading(true);
      const response = await callApi<UserListStatsApiResponse>(`/api/users/${user.id}/lists/${list.id}/stats`);
      if (response.data.success && 'stats' in response.data) {
        setStats(response.data.stats);
      }
      setIsLoading(false);
    }
    retrieve();
  }, [list, user]);

  const pct = stats ? Math.round((stats.watched / stats.movies) * 100) : 0;
  const listPath = list.url.replace('https://letterboxd.com', '') + '?view=only-unwatched';

  return (
    <AppLink color="#ffffff" href={listPath}>
      <ListProgressCircularChart isLoading={isLoading || !stats} pct={pct} title={list.title} />
    </AppLink>
  );
}