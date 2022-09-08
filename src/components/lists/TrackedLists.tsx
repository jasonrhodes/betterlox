import { Box, CircularProgress, Grid, LinearProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse, ListUserStats, UserListStatsApiResponse } from "../../common/types/api";
import { UserPublicSafe } from "../../common/types/db";
import { LetterboxdList } from "../../db/entities";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";


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

  return (
    <Box sx={{ mb: 2, mr: 2, position: "relative", width: 200, height: 200 }}>
      <CircularProgress
        size={200}
        thickness={1}
        variant="determinate"
        value={100}
        sx={{ color: "rgba(0,0,0,0.3)", position: "absolute", top: 0, left: 0 }}
      />
      <CircularProgress
        size={200}
        thickness={1} 
        color={pct === 100 ? "success" : "secondary"}
        value={pct} 
        variant={isLoading || !stats ? "indeterminate" : "determinate"}
        sx={{ position: "absolute", top: 0, left: 0 }}
      />
      <Box sx={{ height: 150, width: 150, position: "absolute", top: 20, left: 25, display: "flex" , alignItems: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: '36px', textAlign: 'center', width: '100%' }}>{pct}<Typography component="span" sx={{ fontSize: '24px', position: 'relative', top: '-4px', left: '2px' }}>%</Typography></Typography>
        <Typography component="div" sx={{ fontSize: '12px', textAlign: 'center', width: '100%' }}>
          {list.title}
        </Typography>
      </Box>
    </Box>
  );
}