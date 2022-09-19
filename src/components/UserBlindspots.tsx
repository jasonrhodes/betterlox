import { Box, LinearProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { EntryApiResponse, GlobalFilters, MoviesApiResponse, TmdbPersonByIdResponse } from '../common/types/api';
import { Movie, UserSettings } from '../db/entities';
import { callApi } from '../hooks/useApi';
import { UserPublic } from '../common/types/db';
import { convertYearsToRange } from '../lib/convertYearsToRange';
import { convertFiltersToQueryString } from '../lib/convertFiltersToQueryString';
import { MoviesTable } from './MoviesTable';
import { PartialMovie } from '../common/types/base';
import { SortControls, useSorting } from '../hooks/useSorting';

interface GetBlindspotsForUserOptions {
  entries: EntryApiResponse[];
  filters: GlobalFilters;
  user?: UserPublic;
}

interface MissingMovieExtras {
  reason: string;
  castOrder?: number;
  voteCount?: number;
  collectionIds: number[];
}

export type MissingMovie = Pick<Movie, 'id' | 'title' | 'imdbId' | 'posterPath' | 'popularity' | 'releaseDate' | 'genres'> & MissingMovieExtras;

type BlindspotsSortBy = 'popularity' | 'releaseDate' | 'title';


export function Blindspots({ blindspots, isLoading }: { blindspots: PartialMovie[]; isLoading?: boolean }) {
  const [sorted, setSorted] = useState<PartialMovie[]>([]);
  const [isSorting, setIsSorting] = useState<boolean>(false);
  // const [sortBy, setSortBy] = useState<SortBy>('popularity');
  // const [sortDir, setSortDir] = useState<SortDir>('DESC')

  const sorting = useSorting<BlindspotsSortBy>('popularity', 'DESC');
  const { sortBy, sortDir } = sorting;

  useEffect(() => {
    async function retrieve() {
      setIsSorting(true);

      const sorted = blindspots.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (typeof aVal === 'undefined' || typeof bVal === "undefined") {
          return 0;
        }
        const val = (aVal > bVal) ? -1 : 1;
        const finalVal = (sortDir === 'ASC') ? (val * -1) : val;
        // console.log(aVal, bVal, sortDir, val, finalVal);
        return finalVal;
      });
      setSorted(blindspots);
      setIsSorting(false);
    }
    retrieve();
  }, [blindspots, sortBy, sortDir]);

  if (isLoading || isSorting) {
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
          popularity: 'Popularity',
          releaseDate: 'Release Date',
          title: 'Movie Title'
        }} />
      </Box>
      <MoviesTable movies={sorted} isLoading={false} />
    </Box>
  )
}

interface HasId {
  id: unknown;
};

interface HasNumericId {
  id: number;
};

function hasId(x: unknown): x is HasId {
  return Boolean(x)
    && typeof x === "object"
    && x !== null
    && ("id" in x);
}

function hasNumericId(x: unknown): x is HasNumericId {
  return hasId(x) && typeof x.id === "number";
}

function getCollectionsFromTmdb(c: unknown) {
  if (hasNumericId(c)) {
    return [c.id];
  } else {
    return [];
  }
}

function findMissing(seen: number[], potentials: MissingMovie[]): MissingMovie[];
function findMissing(seen: number[], potentails: Movie[]): Movie[];
function findMissing(seen: number[], potentials:(MissingMovie | Movie)[]) {
  const missing = potentials.filter((movie) => {
    if (seen.includes(movie.id)) {
      return false;
    }

    const d = new Date(movie.releaseDate);
    const now = new Date();
    if (d.toString() !== "Invalid Date" && d.getTime() > now.getTime()) {
      return false;
    }

    // Remove undervoted/under popular movies ...
    const underVoted = ('voteCount' in movie && typeof movie.voteCount === "number") && movie.voteCount < 25;
    const unpopular = (typeof movie.popularity === "number") && movie.popularity < 5;

    if (underVoted && unpopular) {
      return false;
    }

    return true;
  });

  missing.sort((a, b) => a.popularity > b.popularity ? -1 : 1);
  return missing;
}

async function findPeoplePotentials(currentEntries: number[], filters: GlobalFilters, settings?: UserSettings | null) {
  const allPeopleSets: MissingMovie[][] = [];

  if (filters.actors?.length) {
    const actors = (await Promise.all(filters.actors.map((actorId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${actorId}`)))).map(response => response.data?.person);

    actors.forEach((actor) => {
      const actorMovies: MissingMovie[] = [];
      actor.movie_credits.cast?.forEach((credit) => {
        if (
          credit.id && 
          credit.title && 
          typeof credit.popularity === "number" &&
          typeof credit.order === "number" &&
          credit.order <= (settings?.statsMinCastOrder || 10000) && 
          !currentEntries.includes(credit.id)
        ) {
          actorMovies.push({
            id: credit.id,
            reason: `${actor.name} plays ${credit.character || '(unknown)'}`,
            title: credit.title,
            genres: (credit.genres || []).map(g => g.name || 'unknown'),
            collectionIds: getCollectionsFromTmdb(credit.belongs_to_collection),
            imdbId: credit.imdb_id || '',
            posterPath: credit.poster_path || '',
            popularity: credit.popularity,
            releaseDate: credit.release_date || '',
            castOrder: credit.order,
            voteCount: credit.vote_count
          });
        }
      });
      allPeopleSets.push(actorMovies);
    });

  }

  if (filters.directors?.length) {
    const directors = (await Promise.all(filters.directors.map((personId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${personId}`)))).map(response => response.data?.person);
    directors.forEach((person) => {
      const directorMovies: MissingMovie[] = [];
      person.movie_credits.crew?.forEach((role) => {
        if (
          role.id && 
          role.title && 
          role.job === "Director" && 
          typeof role.popularity === "number" && 
          !currentEntries.includes(role.id)
        ) {
          directorMovies.push({
            id: role.id,
            reason: `Directed by ${person.name}`,
            title: role.title,
            genres: (role.genres || []).map(g => g.name || 'unknown'),
            collectionIds: [],
            imdbId: role.imdb_id || '',
            posterPath: role.poster_path || '',
            popularity: role.popularity,
            releaseDate: role.release_date || '',
            voteCount: role.vote_count
          });
        }
      });
      allPeopleSets.push(directorMovies);
    });
  }

  const overlapping = allPeopleSets.reduce<MissingMovie[]>((prev, current) => {
    if (prev.length === 0) {
      return current;
    }
    const prevIds = prev.map((m) => m.id);
    const overlap = current.filter((movie) => prevIds.includes(movie.id));
    return overlap;
  }, []);

  return overlapping;
}

async function findNonPeoplePotentials(filters: GlobalFilters, userId?: number) {
  // call a local movies API and request top x movies for filters
  let qs = convertFiltersToQueryString(filters);
  if (userId) {
    qs += `&blindspotsForUser=${userId}`;
  }
  qs += '&limit=100';

  const { data } = await callApi<MoviesApiResponse>(`/api/movies?${qs}`);
  if ('movies' in data) {
    return data.movies;
  }
  return [];
}

function applyNonPeopleFiltersToPeople(movies: MissingMovie[], filters: GlobalFilters) {
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
  user
}: GetBlindspotsForUserOptions): Promise<PartialMovie[]> {
  const currentEntryIds = entries.map(r => r.movieId);
  const peoplePotentials = await findPeoplePotentials(currentEntryIds, filters, user?.settings);

  let blindspots: PartialMovie[] = [];

  if (peoplePotentials.length > 0) {
    const combinedPotentials = await applyNonPeopleFiltersToPeople(peoplePotentials, filters);
    blindspots = findMissing(currentEntryIds, combinedPotentials);
  } else {
    blindspots = await findNonPeoplePotentials(filters, user?.id);
  }

  return blindspots;
}