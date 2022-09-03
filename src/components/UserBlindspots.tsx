import { Box, LinearProgress, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { EntryApiResponse, GlobalFilters, MoviesApiResponse, TmdbCollectionByIdResponse, TmdbPersonByIdResponse } from '../common/types/api';
import { Movie, UserSettings } from '../db/entities';
import { callApi } from '../hooks/useApi';
import { useGlobalFilters } from '../hooks/GlobalFiltersContext';
import { useCurrentUser } from '../hooks/UserContext';
import { UserPublic } from '../common/types/db';
import { convertYearsToRange } from '../lib/convertYearsToRange';
import { TmdbCollection } from '../lib/tmdb';
import { convertFiltersToQueryString } from '../lib/convertFiltersToQueryString';
import { MoviesTable } from './MoviesTable';
import { PartialMovie } from '../common/types/base';

interface GetMissingOptions {
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

export function Blindspots({ entries }: { entries: EntryApiResponse[] }) {
  const { globalFilters } = useGlobalFilters();
  const { user } = useCurrentUser();
  const [blindspots, setBlindspots] = useState<PartialMovie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function retrieve() {
      setIsLoading(true);
      const blindspots = await getBlindspotsForFilters({
        entries, 
        filters: globalFilters, 
        user 
      });
      setBlindspots(blindspots);
      setIsLoading(false);
    }
    retrieve();
  }, [entries, globalFilters, user]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (blindspots.length === 0) {
    return <Typography>No blindspots for these filters.</Typography>;
  }
  
  return (
    <MoviesTable movies={blindspots} isLoading={false} />
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
          const collectionId = (role.belongs_to_collection as TmdbCollection).id; 
          directorMovies.push({
            id: role.id,
            reason: `Directed by ${person.name}`,
            title: role.title,
            genres: (role.genres || []).map(g => g.name || 'unknown'),
            collectionIds: getCollectionsFromTmdb(role.belongs_to_collection),
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
}: GetMissingOptions): Promise<PartialMovie[]> {
  const currentEntryIds = entries.map(r => r.movieId);
  const peoplePotentials = await findPeoplePotentials(currentEntryIds, filters, user?.settings);

  if (peoplePotentials.length > 0) {
    const combinedPotentials = await applyNonPeopleFiltersToPeople(peoplePotentials, filters);
    return findMissing(currentEntryIds, combinedPotentials);
  } else {
    const nonPeoplePotentials = await findNonPeoplePotentials(filters, user?.id);
    return nonPeoplePotentials;
  }


  // if (filters.collections?.length) {
  //   const collections = (await Promise.all(
  //     filters.collections.map(
  //       (collectionId) => callApi<TmdbCollectionByIdResponse>(`/api/tmdb/collections/${collectionId}`)
  //     )
  //   ))
  //   .map(response => response.data?.collection);
    
  //   for (const collection of collections) {
  //     if (!collection.parts) {
  //       continue;
  //     }
  //     for (const movie of collection.parts) {
  //       if (!movie.id || !movie.title || typeof movie.popularity !== "number" || currentEntryIds.includes(movie.id)) {
  //         continue;
  //       }
  //       missing.push({
  //         id: movie.id,
  //         reason: `One of the ${collection.name}`,
  //         title: movie.title,
  //         imdbId: movie.imdb_id || '',
  //         posterPath: movie.poster_path || '',
  //         popularity: movie.popularity,
  //         releaseDate: movie.release_date || '',
  //         voteCount: movie.vote_count
  //       });
  //     }
  //   }
  // }
}