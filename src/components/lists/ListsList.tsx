import { CalendarMonth, Close, PersonPin, Theaters } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, FormControlLabel, InputAdornment, LinearProgress, Link, Pagination, Switch, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { LetterboxdListsForUserApiResponse } from "../../common/types/api";
import { UserPublicSafe, UserResponse } from "../../common/types/db";
import { escapeRegExp } from "../../lib/escapeRegex";
import { LetterboxdList, LetterboxdListMovieEntry, Movie } from "../../db/entities";
import { callApi } from "../../hooks/useApi";
import { useCurrentUser } from "../../hooks/UserContext";
import { SortControls, useSorting } from "../../hooks/useSorting";
import { TMDBImage } from "../images";
import { AppLink } from "../AppLink";

type ListSortBy = 'publishDate' | 'lastUpdated' | 'title';
type ListScope = 'user-owned' | 'user-following' | 'all';

function getApiForScope(scope: ListScope, user: UserResponse | UserPublicSafe) {
  switch (scope) {
    case 'user-owned':
      return `/api/users/${user.id}/lists`;
    case 'user-following':
      return `/api/users/${user.id}/lists/following`;
    case 'all':
    default:
      return `/api/lists/letterboxd`;
  }
}

export function ListsList({ scope }: { scope: ListScope }) {
  const [lists, setLists] = useState<LetterboxdList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quickSearchValue, updateQuickSearchValue] = useState<string>('');
  const [perPage] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const sorting = useSorting<ListSortBy>('lastUpdated', 'DESC');
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      if (!user) {
        return;
      }
      setIsLoading(true);
      const baseUrl = getApiForScope(scope, user);
      const response = await callApi<LetterboxdListsForUserApiResponse>(`${baseUrl}?sortBy=${sorting.sortBy}&sortDir=${sorting.sortDir}&q=${encodeURIComponent(quickSearchValue)}&perPage=${perPage}&page=${page}`);
      if (response.data?.success && 'lists' in response.data) {
        setLists(response.data.lists);
      }
      if (response.data?.success && 'totalCount' in response.data) {
        setTotalPages(Math.ceil(response.data.totalCount / perPage));
      }
      setIsLoading(false);
    }
    retrieve();
  }, [user, sorting.sortDir, sorting.sortBy, scope, quickSearchValue, perPage, page]);

  const handleQuickSearchChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>>((event) => {
    updateQuickSearchValue(escapeRegExp(event.target.value));
  }, []);

  if (!isLoading && quickSearchValue === '' && lists.length === 0) {
    return (
      <Box sx={{ maxWidth: 600 }}>
        <Typography variant="h6" component="h2">No Lists Synced</Typography>
        <Typography sx={{ my: 2 }} variant="body1">To sync all of your lists from Letterboxd, visit <AppLink href="/account/sync">your sync page</AppLink>. Alternatively, you can visit the &ldquo;Import List&rdquo; tab on this page to add individual lists (your own or others).</Typography>
        <Alert severity="info"><AlertTitle>Coming Soon</AlertTitle>Add and follow other people&apos;s lists instead of or in addition to your own...</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ mb: 2 }}>
        <TextField 
          size="small" 
          label="Quick Search" 
          value={quickSearchValue} 
          onChange={handleQuickSearchChange} 
          sx={{
            mr: 1
          }}
          InputProps={{
            endAdornment: <InputAdornment position="end"><Close sx={{ cursor: 'pointer' }} onClick={() => updateQuickSearchValue('')} /></InputAdornment>
          }}
        />
        <SortControls<ListSortBy> {...sorting} sortByOptions={{
          lastUpdated: 'Last Updated',
          publishDate: 'Publish Date',
          title: 'List Title'
        }} />
      </Box>
      {isLoading ? <LinearProgress /> : lists.map(list => (
        <Box key={list.id} sx={{ mb: 3 }}>
          <Link color="secondary" underline="hover" href={list.url} target="_blank" rel="noreferrer">
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{list.title}</Typography>
          </Link>
          <ListMeta list={list} user={user} sortBy={sorting.sortBy} />
          <ListMoviePosterPreview n={10} movieEntries={list.movies} />
        </Box>
      ))}
      {(!isLoading && totalPages > 1) ? <Box sx={{ my: 2 }}>
        <Pagination
          page={page}
          onChange={(e, value) => setPage(value)}
          count={totalPages}
        />
      </Box> : null}
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
      {posters.slice(0, n).map(posterPath => (
        <Box key={posterPath} sx={{ my: 1, marginRight: 1 }}>
          <TMDBImage tmdbPath={posterPath} width={50} height={80} />
        </Box>
      ))}
    </Box>
  )
}

function ListMeta({ list, user, sortBy }: { list: LetterboxdList; user?: UserPublicSafe; sortBy: ListSortBy }) {
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
      {(updated && sortBy !== "publishDate") ? <Meta icon={<CalendarMonth fontSize="small" />} label={`Last Updated: ${(new Date(updated).toLocaleDateString())}`} /> : null}
      {(list.publishDate && sortBy === "publishDate") ? <Meta icon={<CalendarMonth fontSize="small" />} label={`Published: ${(new Date(list.publishDate)).toLocaleDateString()}`} /> : null}
      <FormControlLabel sx={{ px: 1 }} control={<Switch disabled={isLoading} size="small" color="secondary" checked={isTracked} onChange={handleTrackedChange} />} label={<Typography variant="caption">Track my progress</Typography>} />
      {!owned ? <FormControlLabel sx={{ px: 1 }} control={<Switch disabled={isLoading} size="small" color="secondary" checked={isFollowing} onChange={handleFollowChange} />} label={<Typography variant="caption">Follow List</Typography>} /> : null}
    </Box>
  )
}

function Meta({ label, icon }: { label: string | JSX.Element; icon?: JSX.Element }) {
  return (
    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      {icon ? <Box sx={{ mr: 1 }}>{icon}</Box> : null}
      {label}
    </Typography>
  );
}