import { Box, LinearProgress, SxProps, useMediaQuery, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse, ListUserStats, UserListStatsApiResponse } from "../../common/types/api";
import type { UserPublicSafe } from "@rhodesjason/loxdb/dist/common/types/db";
import type { LetterboxdList } from "@rhodesjason/loxdb/dist/db/entities";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { AppLink } from "../AppLink";
import { ListProgressCircularChart } from "./ListProgressCircularChart";

export function MyTrackedLists() {
  const [lists, setLists] = useState<LetterboxdList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useCurrentUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const gridXSpacing = isMobile ? 'space-evenly' : 'flex-start';

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

  const extraStyles: SxProps = isMobile ? {} : {
    mb: 2, mr: 1
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: gridXSpacing }}>
      {lists.map(list => (
        <Box key={list.id} sx={{ mb: 1, ...extraStyles }}>
          <ListStatsCard isMobile={isMobile} list={list} user={user} />
        </Box>
      ))}
    </Box>
  );
}

function ListStatsCard({ list, user, isMobile }: { list: LetterboxdList; user: UserPublicSafe; isMobile?: boolean; }) {
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
  const listPath = list.url.replace('https://letterboxd.com', '');

  return (
    <AppLink underline="none" color="#ffffff" href={listPath}>
      <ListProgressCircularChart isLoading={isLoading || !stats} pct={pct} title={list.title} isMobile={isMobile} />
    </AppLink>
  );
}