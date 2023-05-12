import { CalendarMonth, PersonPin, Theaters } from "@mui/icons-material";
import { Box, FormControlLabel, Link, Switch, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { UserPublicSafe } from "@rhodesjason/loxdb/dist/common/types/db";
import type { LetterboxdList } from "@rhodesjason/loxdb/dist/db/entities";
import { callApi } from "../../hooks/useApi";
import { Meta } from "../Meta";

export interface ListMetaOptions {
  list: LetterboxdList; 
  user?: UserPublicSafe; 
  showPublishDate?: boolean;
  showUpdatedDate?: boolean;
}

export function ListMeta({ list, user, showPublishDate = true, showUpdatedDate = true }: ListMetaOptions) {
  const [isTracked, setIsTracked] = useState<boolean>(Boolean(list.trackers?.find(u => u.id === user?.id)));
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(list.followers?.find(u => u.id === user?.id)));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const updated = list.lastUpdated || list.publishDate;

  const handleTrackedChange = useCallback(async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    const action = isTracked ? "untrack" : "track";
    await callApi(`/api/users/${user.id}/lists/${list.id}/${action}`, { method: 'POST' });
    setIsTracked(!isTracked);
    setIsLoading(false);
  }, [isTracked, setIsTracked, user, list.id]);

  const handleFollowChange = useCallback(async () => {
    if (!user) {
      return;
    }
    setIsLoading(true);
    const action = isFollowing ? "unfollow" : "follow";
    await callApi(`/api/users/${user.id}/lists/${list.id}/${action}`, { method: 'POST' });
    setIsFollowing(!isFollowing);
    setIsLoading(false);
  }, [isFollowing, setIsFollowing, user, list.id]);

  const owned = Boolean(user?.id && list.owner?.id && list.owner.id === user.id);

  return (
    <Box sx={{ my: 1 }}>
      <Meta icon={<Theaters fontSize="small" />} label={`${list.movies.length} movies`} />
      
      {!owned ? <Meta icon={<PersonPin fontSize="small" />} label={<>Owned by:&nbsp;<Link color="secondary" target="_blank" rel="noreferrer" href={`https://letterboxd.com/${list.letterboxdUsername}`}>{list.letterboxdUsername}</Link></>} /> : null}
      
      {(updated && showUpdatedDate) ? <Meta icon={<CalendarMonth fontSize="small" />} label={`Last Updated: ${(new Date(updated).toLocaleDateString())}`} /> : null}
      
      {(list.publishDate && showPublishDate) ? <Meta icon={<CalendarMonth fontSize="small" />} label={`Published: ${(new Date(list.publishDate)).toLocaleDateString()}`} /> : null}
      
      <FormControlLabel sx={{ px: 1 }} control={<Switch disabled={isLoading} size="small" color="secondary" checked={isTracked} onChange={handleTrackedChange} />} label={<Typography variant="caption">Track my progress</Typography>} />
      
      {!owned ? <FormControlLabel sx={{ px: 1 }} control={<Switch disabled={isLoading} size="small" color="secondary" checked={isFollowing} onChange={handleFollowChange} />} label={<Typography variant="caption">Follow List</Typography>} /> : null}
    </Box>
  )
}