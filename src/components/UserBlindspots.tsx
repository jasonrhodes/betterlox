import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { BlindspotMovie, BlindspotsSortBy, EntryApiResponse, GlobalFilters, TmdbPersonByIdResponse, UserBlindspotsApiResponse } from "../common/types/api";
import { UserSettings } from '@rhodesjason/loxdb/dist/db/entities';
import { callApi } from '../hooks/useApi';
import { UserPublic } from "@rhodesjason/loxdb/dist/common/types/db";
import { convertYearsToRange } from '@rhodesjason/loxdb/dist/lib/convertYearsToRange';
import { convertFiltersToQueryString } from '@rhodesjason/loxdb/dist/lib/convertFiltersToQueryString';
import { MoviesTable } from './MoviesTable';
import { SortControls, SortManagement, useSorting } from '../hooks/useSorting';

interface GetBlindspotsForUserOptions {
  entries: EntryApiResponse[];
  filters: GlobalFilters;
  user?: UserPublic;
  sorting: SortManagement<BlindspotsSortBy>;
}

interface BlindspotsOptions {
  blindspots: BlindspotMovie[]; 
  isLoading?: boolean;
  sorting: SortManagement<BlindspotsSortBy>;
}

export function Blindspots({ blindspots, isLoading, sorting }: BlindspotsOptions) {
  if (isLoading) {
    return <LinearProgress />;
  }

  if (blindspots.length === 0) {
    return (
      <>
        <Typography variant="h6">Nice work! 🎉 🎉 🎉</Typography>
        <Typography>Looks like you&apos;ve seen everything for these filters.</Typography>
      </>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <SortControls<BlindspotsSortBy> {...sorting} sortByOptions={{
          loxScore: 'Lox Popularity',
          loxMostRated: 'Lox Most Watched',
          loxHighestRated: 'Lox Highest Rated',
          releaseDate: 'Release Date',
          title: 'Movie Title'
        }} />
      </Box>
      <MoviesTable movies={blindspots} isLoading={false} />
    </Box>
  )
}

interface FindPeopleBlindspotsOptions { 
  currentEntryIds: number[];
  filters: GlobalFilters;
  settings?: UserSettings | null;
}

async function findPeopleBlindspots({
  currentEntryIds,
  filters,
  settings
}: FindPeopleBlindspotsOptions) {
  const allPeopleSets: BlindspotMovie[][] = [];

  if (filters.actors?.length) {
    const actors = (await Promise.all(filters.actors.map((actorId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${actorId}`)))).map(response => response.data?.person);

    actors.forEach((actor) => {
      const actorMovies: BlindspotMovie[] = [];
      actor.movie_credits.cast?.forEach((credit) => {
        if (
          credit.id && 
          credit.title && 
          typeof credit.popularity === "number" &&
          typeof credit.order === "number" &&
          credit.order <= (settings?.statsMinCastOrder || 10000) && 
          !currentEntryIds.includes(credit.id)
        ) {
          actorMovies.push({
            id: credit.id,
            reason: `${actor.name} plays ${credit.character || '(unknown)'}`,
            title: credit.title,
            genres: (credit.genres || []).map(g => g.name || 'unknown'),
            // collectionIds: getCollectionsFromTmdb(credit.belongs_to_collection),
            imdbId: credit.imdb_id || '',
            posterPath: credit.poster_path || '',
            popularity: credit.popularity,
            releaseDate: credit.release_date || '',
            runtime: credit.runtime || 0,
            status: credit.status || '',
            averageRating: 0,
            countRatings: 0,
            loxScore: 0
            // castOrder: credit.order,
            // voteCount: credit.vote_count
          });
        }
      });
      allPeopleSets.push(actorMovies);
    });

  }

  if (filters.directors?.length) {
    const directors = (await Promise.all(filters.directors.map((personId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${personId}`)))).map(response => response.data?.person);
    directors.forEach((person) => {
      const directorMovies: BlindspotMovie[] = [];
      person.movie_credits.crew?.forEach((role) => {
        if (
          role.id && 
          role.title && 
          role.job === "Director" && 
          typeof role.popularity === "number" && 
          !currentEntryIds.includes(role.id)
        ) {
          directorMovies.push({
            id: role.id,
            reason: `Directed by ${person.name}`,
            title: role.title,
            genres: (role.genres || []).map(g => g.name || 'unknown'),
            // collectionIds: [],
            imdbId: role.imdb_id || '',
            posterPath: role.poster_path || '',
            popularity: role.popularity,
            releaseDate: role.release_date || '',
            runtime: role.runtime || 0,
            status: role.status || '',
            averageRating: 0,
            countRatings: 0,
            loxScore: 0
            // voteCount: role.vote_count
          });
        }
      });
      allPeopleSets.push(directorMovies);
    });
  }

  // TODO: Add editors, writers, etc?

  const overlapping = allPeopleSets.reduce<BlindspotMovie[]>((prev, current) => {
    if (prev.length === 0) {
      return current;
    }
    const prevIds = prev.map((m) => m.id);
    const overlap = current.filter((movie) => prevIds.includes(movie.id));
    return overlap;
  }, []);

  return await applyFiltersToPeopleBlindspots(overlapping, filters);
}

interface FindLoxBlindspotsOptions {
  filters: GlobalFilters;
  userId: number;
  sorting: SortManagement<BlindspotsSortBy>;
  ids?: number[];
}

async function findLoxBlindspots({ filters, userId, sorting, ids }: FindLoxBlindspotsOptions) {
  // call a local movies API and request top x movies for filters
  let qs = convertFiltersToQueryString(filters);
  qs += `&limit=100&sortBy=${sorting.sortBy}&sortDir=${sorting.sortDir}`;
  
  if (ids) {
    qs += `&movieIds=${ids.join(',')}`;
  }

  const { data } = await callApi<UserBlindspotsApiResponse>(`/api/users/${userId}/blindspots?${qs}`);
  if (data.success && 'blindspots' in data) {
    return data;
  }
  return { blindspots: [], extras: undefined, unknownIds: undefined };
}

function applyFiltersToPeopleBlindspots(movies: BlindspotMovie[], filters: GlobalFilters) {
  const {
    genres = [],
    excludedGenres = []
  } = filters;
  const dateRange = convertYearsToRange(filters.releaseDateRange || undefined);
  const startTime = (new Date(dateRange[0])).getTime();
  const endTime = (new Date(dateRange[1])).getTime();

  return movies.filter((movie) => {
    if (genres.length > 0) {
      if (movie.genres.some((g) => !genres.includes(g))) {
        return false;
      }
    }

    if (excludedGenres.length > 0) {
      if (movie.genres.some((g) => excludedGenres.includes(g))) {
        return false;
      }
    }

    if (dateRange.length === 2) {
      const movieReleaseTime = (new Date(movie.releaseDate)).getTime();
      if (movieReleaseTime < startTime) {
        return false;
      }
      if (movieReleaseTime > endTime) {
        return false;
      }
    }

    return true;
  });
}

export async function getBlindspotsForFilters({ 
  entries, 
  filters,
  user,
  sorting
}: GetBlindspotsForUserOptions): Promise<BlindspotMovie[]> {
  if (!user) {
    return [];
  }

  const currentEntryIds = entries.map(r => r.movieId);
  const peopleBlindspots = await findPeopleBlindspots({
    currentEntryIds, 
    filters, 
    settings: user.settings
  });
  const peopleBlindspotIds = peopleBlindspots.map(b => b.id);

  const { blindspots, extras, unknownIds } = await findLoxBlindspots({
    filters,
    userId: user.id,
    sorting,
    ids: peopleBlindspotIds
  });

  if (unknownIds && unknownIds.length > 0) {
    let mergedBlindspots: BlindspotMovie[] = [];
    const unknownBlindspots = peopleBlindspots.filter(b => unknownIds.includes(b.id));
    if (sorting.sortBy.startsWith("lox")) {
      unknownBlindspots.sort((a, b) => {
        const val = a.popularity > b.popularity ? -1 : 1;
        return sorting.sortDir === 'DESC' ? val : val * -1;
      });
      mergedBlindspots = blindspots.concat(unknownBlindspots);
    } else {
      mergedBlindspots = blindspots.concat(unknownBlindspots);
      mergedBlindspots.sort((a, b) => {
        let val = 0;
        if (sorting.sortBy === "title") {
          val = (a.title > b.title) ? -1 : 1;
        }
        if (sorting.sortBy === "releaseDate") {
          const aTime = (new Date(a.releaseDate)).getTime();
          const bTime = (new Date(b.releaseDate)).getTime();
          val = (aTime > bTime) ? -1 : 1;
        }
        return sorting.sortDir === 'DESC' ? val : val * -1;
      });
    }

    return mergedBlindspots;
  }

  return blindspots;
}