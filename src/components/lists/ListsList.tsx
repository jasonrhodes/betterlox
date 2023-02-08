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
import { ListMeta } from "./ListMeta";
import { ListScope, ListSortBy } from "../../common/types/base";

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
            mr: 1,
            mb: 2
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
          <AppLink href={list.url.replace('https://letterboxd.com', '')}>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>{list.title}</Typography>
          </AppLink>
          <ListMeta 
            list={list} 
            user={user} 
            showPublishDate={sorting.sortBy === "publishDate"}
            showUpdatedDate={sorting.sortBy !== "publishDate"}
          />
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
          <TMDBImage alt="" tmdbPath={posterPath} width={50} height={80} />
        </Box>
      ))}
    </Box>
  )
}

