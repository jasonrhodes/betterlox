import { CalendarMonth, FormatListBulleted, FormatListNumbered, Theaters } from "@mui/icons-material";
import { Badge, Box, Chip, ChipProps, FormControlLabel, LinearProgress, Link, Switch, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse } from "../../common/types/api";
import { UserPublic, UserPublicSafe } from "../../common/types/db";
import { LetterboxdList, LetterboxdListMovieEntry, Movie } from "../../db/entities";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { SortControls, useSorting } from "../../hooks/useSorting";
import { TMDBImage } from "../images";

type ListSortBy = 'publishDate' | 'lastUpdated' | 'title' | 'filmCount';

export function MyLists() {
  const [lists, setLists] = useState<LetterboxdList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const sorting = useSorting<ListSortBy>('lastUpdated', 'DESC');
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      const response = await callApi<LetterboxdListsForUserApiResponse>(`/api/users/${user.id}/lists?sortBy=${sorting.sortBy}&sortDir=${sorting.sortDir}`);
      if (response.data?.success && 'lists' in response.data) {
        setLists(response.data.lists);
      }
      setIsLoading(false);
    }
    retrieve();
  }, [user, sorting.sortDir]);

  if (isLoading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ mb: 2 }}>
        <SortControls<ListSortBy> {...sorting} sortByOptions={{
          lastUpdated: 'Last Updated',
          publishDate: 'Publish Date',
          title: 'List Title',
          filmCount: 'Film Count'
        }} />
      </Box>
      {lists.map(list => (
        <Box key={list.id} sx={{ mb: 3 }}>
          <Link color="secondary" underline="hover" href={`https://letterboxd.com${list.url}`} target="_blank" rel="noreferrer">
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{list.title}</Typography>
          </Link>
          {list.description ? <Typography component="p" variant="caption" sx={{ lineHeight: 1.4 }}>{list.description.substring(0, 250)}</Typography> : null}
          <ListMeta list={list} user={user} sortBy={sorting.sortBy} />
          <ListMoviePosterPreview n={10} movieEntries={list.movies} />
        </Box>
      ))}
    </Box>
  );
}

interface ListMoviePosterPreviewOptions {
  n: number;
  movieEntries: LetterboxdListMovieEntry[];
}

function isMovie(m: LetterboxdListMovieEntry['movie'] | null | undefined): m is Movie {
  return typeof m === "object" && m !== null && 'id' in m;
}

function isString(v: any): v is string {
  return typeof v === "string";
}

function ListMoviePosterPreview({ movieEntries, n }: ListMoviePosterPreviewOptions) {
  const posters = movieEntries.map(e => e.movie).filter(isMovie).map(m => m.posterPath).filter(isString);
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
      {posters.slice(0, n).map(poster => (
        <Box sx={{ my: 1, marginRight: 1 }}>
          <TMDBImage tmdbPath={poster} width={50} height={80} />
        </Box>
      ))}
    </Box>
  )
}

function ListMeta({ list, user, sortBy }: { list: LetterboxdList; user?: UserPublicSafe; sortBy: ListSortBy }) {
  const [isTracked, setIsTracked] = useState<boolean>(Boolean(list.trackers.find(u => u.id === user?.id)));
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
  }, [isTracked]);

  return (
    <Box sx={{ my: 1 }}>
      <Meta icon={<Theaters fontSize="small" />} label={`${list.movies.length} movies`} />
      {(updated && sortBy !== "publishDate") ? <Meta icon={<CalendarMonth fontSize="small" />} label={`Last Updated: ${(new Date(updated).toLocaleDateString())}`} /> : null}
      {(list.publishDate && sortBy === "publishDate") ? <Meta icon={<CalendarMonth fontSize="small" />} label={`Published: ${(new Date(list.publishDate)).toLocaleDateString()}`} /> : null}
      <FormControlLabel sx={{ px: 1 }} control={<Switch disabled={isLoading} size="small" color="secondary" checked={isTracked} onChange={handleTrackedChange} />} label={<Typography variant="caption">Track my progress</Typography>} />
    </Box>
  )
}

function Meta({ label, icon }: { label: string, icon?: JSX.Element }) {
  return (
    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {icon ? <Box sx={{ mr: 1 }}>{icon}</Box> : null}
      {label}
    </Typography>
  );
}