import { Badge, Box, Button, Grid, LinearProgress, SxProps, Tooltip, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LetterboxdListBySlugApiResponse, ListUserStats, TmdbMovieByIdApiResponse, TmdbMovieByIdGetResponse, UserListStatsApiResponse } from "../../../common/types/api";
import { UserPublic, UserResponse } from "../../../common/types/db";
import { AppLink } from "../../../components/AppLink";
import { BasicSelect, SelectChangeHandler } from "../../../components/formControls/BasicSelect";
import { TMDBImage } from "../../../components/images";
import { ListMeta } from "../../../components/lists/ListMeta";
import { ListProgressCircularChart } from "../../../components/lists/ListProgressCircularChart";
import { PageTemplate } from "../../../components/PageTemplate";
import { LetterboxdList, Movie } from "../../../db/entities";
import { callApi } from "../../../hooks/useApi";
import { useCurrentUser } from "../../../hooks/UserContext";
import { getErrorAsString } from "../../../lib/getErrorAsString";

const UserListPage: NextPage = () => {
  const router = useRouter();
  const { username, slug } = router.query;
  const [list, setList] = useState<LetterboxdList | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoadedOnce, setHasFinishedLoadingOnce] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<ListUserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    async function retrieve() {
      setError(null);
      setIsLoading(true);
      try {
        const response = await callApi<LetterboxdListBySlugApiResponse>(`/api/lists/letterboxd/${slug}?username=${username}`);
        if ('list' in response.data) {
          setList(response.data.list);

          if (user) {
            const statsResponse = await callApi<UserListStatsApiResponse>(`/api/users/${user.id}/lists/${response.data.list.id}/stats`);
            if (statsResponse.data && 'stats' in statsResponse.data) {
              setUserStats(statsResponse.data.stats);
            }
          }
        } else {
          setList(null);
          setError(response.data.message || 'Error retrieving list');
        }
      } catch (error: unknown) {
        setError(getErrorAsString(error));
      }
      setIsLoading(false);
      setHasFinishedLoadingOnce(true);
    
    }
    retrieve();
  }, 
  [user, username, slug]);

  if ((!list && !hasLoadedOnce) || isLoading) {
    return <LinearProgress />;
  }

  if (!list) {
    return (
      <PageTemplate title={"List not found"}>
        <Typography>Sorry, we couldn&apos;t find this list. <AppLink href="/lists">Return to your lists page.</AppLink></Typography>
      </PageTemplate>
    )
  }
  
  return (
    <PageTemplate title={list.title}>
      <PageContent list={list} userStats={userStats} isLoading={isLoading} />
    </PageTemplate>
  );
}

type ViewMode = "all" | "only-unwatched" | "only-watched" | "all-fade-watched";
function isViewMode(value: any): value is ViewMode {
  return typeof value === "string" && ([
    "all",
    "only-unwatched",
    "only-watched",
    "all-fade-watched"
  ]).includes(value);
}

interface ListControlsOptions {
  list: LetterboxdList; 
  sx?: SxProps;
  isOwnedByCurrentUser: boolean;
  user: UserResponse | UserPublic | undefined;
  isLoading: boolean;
  userStats: ListUserStats | null;
  viewMode: ViewMode;
  handleViewModeChange: SelectChangeHandler<ViewMode>;
}

function ListControls({ list, sx = {}, user, userStats, isOwnedByCurrentUser, isLoading, viewMode, handleViewModeChange }: ListControlsOptions) {
  return (
    <Box sx={sx}>
      {isOwnedByCurrentUser ? <Typography color="primary"><b>This is one of your lists.</b></Typography> : null}
      <Box sx={{ mb: 6 }}>
        <ListMeta list={list} user={user} />
      </Box>
      {userStats && user ? <Box sx={{ mb: 6 }}><ListProgressCircularChart isLoading={isLoading} pct={Math.floor((userStats.watched / list.movies.length) * 100)} title={`You've seen ${userStats.watched} of ${list.movies.length}`} /></Box> : null}
      {user && userStats ? <Box>
        <BasicSelect<ViewMode> 
          size="medium"
          value={viewMode}
          handleValueChange={handleViewModeChange}
          fullWidth={true}
          options={[
            {
              label: "Show all",
              value: "all"
            },
            {
              label: "Fade watched",
              value: "all-fade-watched"
            },
            {
              label: "Show only unwatched",
              value: "only-unwatched"
            },
            {
              label: "Show only watched",
              value: "only-watched"
            }
          ]}
          id="select-view-mode"
          labelId="select-view-mode-label"
          label="View Options"
        />
      </Box> : null}
    </Box>
  )
}

function TruncatedText({ text, maxLength, sx }: { text?: string; maxLength?: number; sx?: SxProps; }) {
  const [showLong, setShowLong] = useState<boolean>(false);

  if (!text || !maxLength) {
    return null;
  }

  const shortText = text.substring(0, maxLength);
  const longText = text;
  const longEqualsShort = shortText.length === longText.length;

  return (
    <Box>
      <Typography sx={sx}>
        {showLong || longEqualsShort ? longText : `${shortText}...`}
      </Typography>
      {!longEqualsShort ? <Button variant="text" onClick={() => setShowLong((show) => !show)}>{showLong ? "Show less" : "Show more"}</Button> : null}
    </Box>
  )
}

function PageContent({ list, userStats, isLoading }: { list: LetterboxdList; userStats: ListUserStats | null; isLoading: boolean; }) {
  const { user } = useCurrentUser();
  const router = useRouter();
  const defaultView = isViewMode(router.query.view) ? router.query.view : "all"
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const isOwnedByCurrentUser = Boolean(user?.id && list?.owner?.id && user.id === list.owner.id);

  const handleViewModeChange: SelectChangeHandler<ViewMode> = useCallback((event) => {
    const { value } = event.target;
    if (isViewMode(value)) {
      setViewMode(value);
    }
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' }}}>
        <ListControls 
          list={list} 
          user={user} 
          userStats={userStats} 
          isOwnedByCurrentUser={isOwnedByCurrentUser} 
          isLoading={isLoading} 
          viewMode={viewMode}
          handleViewModeChange={handleViewModeChange}
          sx={{ mb: 1 }}
        />
      </Grid>
      <Grid item xs={12} md={9}>
        <Box sx={{ mb: 2 }}>
          <TruncatedText text={list.description} maxLength={80} />
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap'}}>
          {list.movies.map(({ movieId, order, movie }) => (
            <ListMovieCard
              key={movieId} 
              order={order}
              movie={movie} 
              movieId={movieId} 
              list={list}
              viewMode={viewMode}
              watched={Boolean(userStats && userStats.watchedIds.includes(movieId))}
            />
          ))}
        </Box>
      </Grid>
      <Grid item xs={12} md={3}>
        <ListControls 
          list={list} 
          user={user} 
          userStats={userStats} 
          isOwnedByCurrentUser={isOwnedByCurrentUser} 
          isLoading={isLoading} 
          viewMode={viewMode}
          handleViewModeChange={handleViewModeChange}
          sx={{ mb: 7, display: { xs: 'none', md: 'block' } }}
        />
      </Grid>
    </Grid>
  );
}

interface ListMovieCardOptions {
  movie: Movie | null;
  order?: number;
  movieId: number;
  list: LetterboxdList;
  watched: boolean;
  viewMode: ViewMode;
}

function noRetrievedMovie(movieId: number) {
  return {
    id: movieId,
    title: undefined,
    posterPath: undefined,
    releaseDate: undefined
  };
}

function ListMovieCard({
  movie,
  order, 
  movieId, 
  list,
  watched,
  viewMode
}: ListMovieCardOptions) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [retrievedMovie, setRetrievedMovie] = useState<TmdbMovieByIdGetResponse['movie']>(noRetrievedMovie(movieId));

  const posterAspectRatio = 1.5;
  const posterWidth = 73;
  const posterHeight = posterWidth * posterAspectRatio;
  
  useEffect(() => {
    async function retrieve() {
      setIsLoading(true);
      const response = await callApi<TmdbMovieByIdApiResponse>(`/api/tmdb/movies/${movieId}`);
      if (response.data && 'movie' in response.data) {
        setRetrievedMovie(response.data.movie);
      } else {
        setRetrievedMovie(noRetrievedMovie(movieId));
      }
      setIsLoading(false);
    }

    if (!movie) {
      retrieve();
    }
  }, [movie, movieId]);

  const shouldShow = viewMode === "all" || 
    viewMode === "all-fade-watched" || 
    (viewMode === "only-watched" && watched) ||
    (viewMode === "only-unwatched" && !watched);

  if (!shouldShow) {
    return null;
  }

  const { title, posterPath, releaseDate } = movie ? movie : retrievedMovie;
  const d = releaseDate ? new Date(releaseDate) : undefined;
  const year = d ? d.getFullYear() : undefined;
  const yearSuffix = year ? ` (${year})` : '';
  const shouldFade = (viewMode === "all-fade-watched") && watched;

  const image = <TMDBImage sx={{ ["& > span"]: {
    border: "1px solid rgba(255,255,255,0.1) !important",
    borderRadius: "5px !important"
  } }} tmdbPath={posterPath} width={posterWidth} height={posterHeight} />;

  return (
    <Box sx={{ mr: 1, mb: list.isRanked ? 4 : 1, opacity: shouldFade ? 0.2 : 1}}>
      <Tooltip title={`${(title || 'Unknown')}${yearSuffix}`} arrow placement="top" followCursor={true}>
        {list.isRanked && typeof order === "number" ? 
          <Badge 
            color="primary"
            showZero
            badgeContent={order + 1} 
            max={order + 1}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            sx={{
              "& .MuiBadge-badge": {
                bottom: '4px',
                left: `${posterWidth / 2}px`,
                padding: '8px',
                height: '26px',
                borderRadius: '5px',
                border: "2px solid rgba(0,0,0,0.4)",
                textShadow: "1px 1px 0 rgba(0,0,0,0.3)",
                color: "#ffffff"
              }
            }}
          >
            {image}
          </Badge> : 
        image}
      </Tooltip>
    </Box>
  )
}

export default UserListPage;