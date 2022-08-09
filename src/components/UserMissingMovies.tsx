import { Box, Card, CardMedia, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { RatingsFilters, TmdbActorByIdResponse, TmdbCollectionByIdResponse } from '../common/types/api';
import { Movie, Rating } from '../db/entities';
import { callApi } from '../hooks/useApi';
import useImageConfigs from "../hooks/useImageConfigs";
import { ImdbLink, LetterboxdLink } from './externalServiceLinks';
import { TMDBImage, useTmdbImageBaseUrl } from './images';

interface GetMissingOptions {
  ratings: Rating[];
  filters: RatingsFilters;
}

type MissingMovie = Pick<Movie, 'id' | 'title' | 'imdbId' | 'posterPath' | 'popularity'>;

export function UserMissingMovies({ ratings, filters }: GetMissingOptions) {
  const [activeCount, setActiveCount] = useState<number>(0);
  const [missing, setMissing] = useState<MissingMovie[]>([]);

  useEffect(() => {
    async function retrieve() {
      const missing = await getMissingForFilters({ ratings, filters });
      setMissing(missing);
    }
    const filterKeys = Object.keys(filters) as Array<keyof RatingsFilters>;
    const activeFilterCount = filterKeys.reduce((count, key) => {
      return count + (filters[key]?.length || 0);
    }, 0);
    setActiveCount(activeFilterCount);
    retrieve();
  }, [ratings, filters]);

  if (activeCount === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6">Your Blindspots</Typography>
      <MissingMovieList movies={missing} />
    </Box>
  );
}

function MissingMovieList({ movies }: { movies: MissingMovie[] }) {
  return (
    <Box>
      {movies.map(movie => <MissingMovieListItem key={movie.id} movie={movie} />)}
    </Box>
  )
}

function MissingMovieListItem({ movie }: { movie: MissingMovie }) {
  return (
    <Box title={movie.title} sx={{ display: 'flex', marginBottom: 1 }}>
      <TMDBImage
        tmdbPath={movie.posterPath}
        alt={`${movie.title} poster`}
        width={33}
        height={50}
        sx={{ marginRight: 1 }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body1"><b>{movie.title}</b></Typography>
        <Typography variant="caption">Popularity: {movie.popularity}</Typography>
        <Box sx={{ display: "flex", py: 1 }}>
          {/* <Box sx={{ marginRight: 1 }}>
            <LetterboxdLink title={movie.title} />
          </Box> */}
          <Box sx={{ marginRight: 1 }}>
            <ImdbLink id={movie.imdbId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

async function getMissingForFilters({ ratings, filters }: GetMissingOptions): Promise<MissingMovie[]> {
  const missing: MissingMovie[] = [];
  const currentRatingIds = ratings.map(r => r.movieId);

  if (filters.actors?.length) {
    const actors = (await Promise.all(filters.actors.map((actorId) => callApi<TmdbActorByIdResponse>(`/api/tmdb/people/${actorId}`)))).map(response => response.data?.actor);
    actors.forEach((actor) => {
      actor.movie_credits.cast?.forEach((credit) => {
        if (credit.id && credit.title && typeof credit.popularity === "number" && !currentRatingIds.includes(credit.id)) {
          missing.push({
            id: credit.id,
            title: credit.title,
            imdbId: credit.imdb_id || '',
            posterPath: credit.poster_path || '',
            popularity: credit.popularity
          });
        }
      });
    });
  }

  if (filters.collections?.length) {
    const collections = (await Promise.all(filters.collections.map((collectionId) => callApi<TmdbCollectionByIdResponse>(`/api/tmdb/collections/${collectionId}`)))).map(response => response.data?.collection);
    collections.forEach((collection) => {
      collection.parts?.forEach((movie) => {
        if (movie.id && movie.title && typeof movie.popularity === "number" && !currentRatingIds.includes(movie.id)) {
          missing.push({
            id: movie.id,
            title: movie.title,
            imdbId: '',
            posterPath: movie.poster_path || '',
            popularity: movie.popularity
          });
        }
      });
    });
  }

  missing.sort((a, b) => a.popularity > b.popularity ? -1 : 1);

  return missing;
}