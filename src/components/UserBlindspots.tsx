import { Box, Typography } from '@mui/material';
import React from 'react';
import { EntryApiResponse, GlobalFilters, TmdbCollectionByIdResponse, TmdbPersonByIdResponse } from '../common/types/api';
import { Movie, FilmEntry } from '../db/entities';
import { callApi } from '../hooks/useApi';
import { TMDBImage } from './images';
import { ImdbSearchLink, LetterboxdSearchLink } from './externalServiceLinks';
import { useGlobalFilters } from '../hooks/GlobalFiltersContext';
import { useCurrentUser } from '../hooks/UserContext';
import { UserPublic } from '../common/types/db';

interface GetMissingOptions {
  entries: EntryApiResponse[];
  filters: GlobalFilters;
  user?: UserPublic;
}

interface MissingMovieExtras {
  reason: string;
  castOrder?: number;
  voteCount?: number;
}

export type MissingMovie = Pick<Movie, 'id' | 'title' | 'imdbId' | 'posterPath' | 'popularity' | 'releaseDate'> & MissingMovieExtras;

export function Blindspots({ entries }: { entries: EntryApiResponse[] }) {
  const { globalFilters } = useGlobalFilters();
  const { user } = useCurrentUser();
  const missing = getBlindspotsForFilters({ entries, filters: globalFilters, user });

  

  return null;
}

export function BlindspotList({ movies }: { movies: MissingMovie[] }) {
  return (
    <Box>
      {movies.map(movie => <BlindspotListItem key={movie.id} movie={movie} />)}
    </Box>
  );
}

function BlindspotListItem({ movie }: { movie: MissingMovie }) {
  return (
    <Box title={movie.title} sx={{ 
      marginBottom: 1
    }}>
      <Box sx={{ display: 'flex' }}>
        {movie.posterPath ? <TMDBImage
          tmdbPath={movie.posterPath}
          alt={`${movie.title} poster`}
          width={33}
          height={50}
          sx={{ marginRight: 1 }}
        /> : null}
        <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: 4 }}>
          <Box sx={{ marginBottom: 0.3 }}>
            <Typography variant="body1"><b>{movie.title}</b> ({movie.releaseDate.substring(0, 4)})</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ marginRight: 1 }}>
              <LetterboxdSearchLink title={movie.title} releaseDate={movie.releaseDate} size={15} />
            </Box>
            <Box sx={{ marginRight: 1 }}>
              <ImdbSearchLink title={movie.title} releaseDate={movie.releaseDate} size={15} />
            </Box>
            <Box sx={{ marginRight: 1, marginTop: '-3px' }}>
              <Typography variant="caption">{movie.reason}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export async function getBlindspotsForFilters({ 
  entries, 
  filters,
  user
}: GetMissingOptions): Promise<MissingMovie[]> {
  const allForPeople: MissingMovie[][] = [];
  const currentEntryIds = entries.map(r => r.movieId);

  if (filters.actors?.length) {
    const actors = (await Promise.all(filters.actors.map((actorId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${actorId}`)))).map(response => response.data?.person);

    const actorMovies: MissingMovie[] = [];
    actors.forEach((actor) => {
      actor.movie_credits.cast?.forEach((credit) => {
        if (
          credit.id && 
          credit.title && 
          typeof credit.popularity === "number" &&
          typeof credit.order === "number" &&
          credit.order <= (user?.settings.statsMinCastOrder || 10000) &&
          !currentEntryIds.includes(credit.id)
        ) {
          actorMovies.push({
            id: credit.id,
            reason: `${actor.name} plays ${credit.character || '(unknown)'}`,
            title: credit.title,
            imdbId: credit.imdb_id || '',
            posterPath: credit.poster_path || '',
            popularity: credit.popularity,
            releaseDate: credit.release_date || '',
            castOrder: credit.order,
            voteCount: credit.vote_count
          });
        }
      });
    });
    allForPeople.push(actorMovies);
  }

  if (filters.directors?.length) {
    const directors = (await Promise.all(filters.directors.map((personId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${personId}`)))).map(response => response.data?.person);
    const directorMovies: MissingMovie[] = [];
    directors.forEach((person) => {
      person.movie_credits.crew?.forEach((role) => {
        if (role.id && role.title && role.job === "Director" && typeof role.popularity === "number" && !currentEntryIds.includes(role.id)) {
          directorMovies.push({
            id: role.id,
            reason: `Directed by ${person.name}`,
            title: role.title,
            imdbId: role.imdb_id || '',
            posterPath: role.poster_path || '',
            popularity: role.popularity,
            releaseDate: role.release_date || '',
            voteCount: role.vote_count
          });
        }
      });
    });
    allForPeople.push(directorMovies);
  }

  const first = allForPeople.shift() || [];
  const overlappingForPeople = allForPeople.reduce((prev, current) => {
    const currentIds = current.map((m) => m.id);
    const overlap = prev.filter((movie) => currentIds.includes(movie.id));
    return overlap;
  }, first);

  if (overlappingForPeople.length > 0) {
    // apply other filters to the overlapping movies
  } else {
    // start with other filters
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

  const filteredMissing = overlappingForPeople.filter((m) => {
    // Remove unreleased movies
    const d = new Date(m.releaseDate);
    const now = new Date();
    if (d.toString() !== "Invalid Date" && d.getTime() > now.getTime()) {
      return false;
    }

    // Remove undervoted/under popular movies ...
    const underVoted = (typeof m.voteCount === "number") && m.voteCount < 25;
    const unpopular = (typeof m.popularity === "number") && m.popularity < 5;

    if (underVoted && unpopular) {
      return false;
    }

    return true;
  });

  filteredMissing.sort((a, b) => a.popularity > b.popularity ? -1 : 1);

  return filteredMissing;
}