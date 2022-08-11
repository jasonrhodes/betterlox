import { Box, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { RatingsFilters, TmdbCollectionByIdResponse, TmdbPersonByIdResponse } from '../common/types/api';
import { Movie, Rating } from '../db/entities';
import { callApi } from '../hooks/useApi';
import { TMDBImage } from './images';
import { ImdbSearchLink, LetterboxdSearchLink } from './externalServiceLinks';

interface GetMissingOptions {
  ratings: Rating[];
  filters: RatingsFilters;
}

interface MissingMovieExtras {
  reason: string;
  castOrder?: number;
  voteCount?: number;
}

export type MissingMovie = Pick<Movie, 'id' | 'title' | 'imdbId' | 'posterPath' | 'popularity' | 'releaseDate'> & MissingMovieExtras;

// export function UserMissingMovies({ ratings, filters }: GetMissingOptions) {
//   const [activeCount, setActiveCount] = useState<number>(0);
//   const [missing, setMissing] = useState<MissingMovie[]>([]);

//   useEffect(() => {
//     async function retrieve() {
//       const missing = await getMissingMoviesForFilters({ ratings, filters });
//       setMissing(missing);
//     }
//     const filterKeys = Object.keys(filters) as Array<keyof RatingsFilters>;
//     const activeFilterCount = filterKeys.reduce((count, key) => {
//       return count + (filters[key]?.length || 0);
//     }, 0);
//     setActiveCount(activeFilterCount);
//     retrieve();
//   }, [ratings, filters]);

//   if (activeCount === 0) {
//     return null;
//   }

//   return <MissingMovieList movies={missing} />;
// }

export function MissingMovieList({ movies }: { movies: MissingMovie[] }) {
  return (
    <Box>
      {movies.map(movie => <MissingMovieListItem key={movie.id} movie={movie} />)}
    </Box>
  );
}

function MissingMovieListItem({ movie }: { movie: MissingMovie }) {
  return (
    <Box title={movie.title} sx={{ 
      marginBottom: 1
    }}>
      <Box sx={{ display: 'flex' }}>
        <TMDBImage
          tmdbPath={movie.posterPath}
          alt={`${movie.title} poster`}
          width={33}
          height={50}
          sx={{ marginRight: 1 }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

export async function getMissingMoviesForFilters({ ratings, filters }: GetMissingOptions): Promise<MissingMovie[]> {
  const missing: MissingMovie[] = [];
  const currentRatingIds = ratings.map(r => r.movieId);

  if (filters.actors?.length) {
    const actors = (await Promise.all(filters.actors.map((actorId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${actorId}`)))).map(response => response.data?.person);
    actors.forEach((actor) => {
      actor.movie_credits.cast?.forEach((credit) => {
        if (credit.id && credit.title && typeof credit.popularity === "number" && !currentRatingIds.includes(credit.id)) {
          missing.push({
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
  }

  if (filters.directors?.length) {
    const directors = (await Promise.all(filters.directors.map((personId) => callApi<TmdbPersonByIdResponse>(`/api/tmdb/people/${personId}`)))).map(response => response.data?.person);
    directors.forEach((person) => {
      person.movie_credits.crew?.forEach((role) => {
        if (role.id && role.title && role.job === "Director" && typeof role.popularity === "number" && !currentRatingIds.includes(role.id)) {
          missing.push({
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
  }

  if (filters.collections?.length) {
    const collections = (await Promise.all(
      filters.collections.map(
        (collectionId) => callApi<TmdbCollectionByIdResponse>(`/api/tmdb/collections/${collectionId}`)
      )
    ))
    .map(response => response.data?.collection);
    
    for (const collection of collections) {
      if (!collection.parts) {
        continue;
      }
      for (const movie of collection.parts) {
        if (!movie.id || !movie.title || typeof movie.popularity !== "number" || currentRatingIds.includes(movie.id)) {
          continue;
        }
        missing.push({
          id: movie.id,
          reason: `One of the ${collection.name}`,
          title: movie.title,
          imdbId: movie.imdb_id || '',
          posterPath: movie.poster_path || '',
          popularity: movie.popularity,
          releaseDate: movie.release_date || '',
          voteCount: movie.vote_count
        });
      }
    }
  }

  const filteredMissing = missing.filter((m) => {
    if (typeof m.castOrder === "number" && m.castOrder > 50) {
      return false;
    }
    const d = new Date(m.releaseDate);
    const now = new Date();
    if (d.toString() !== "Invalid Date" && d.getTime() > now.getTime()) {
      return false;
    }

    // vote count or popularity filter?
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