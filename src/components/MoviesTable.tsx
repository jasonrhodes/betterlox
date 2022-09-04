import React, { useEffect, useState } from 'react';
import { TMDBImage } from './images';
import Image, { ImageProps } from 'next/image';
import { DisplayTable } from './DisplayTable';
import { Box, Typography } from '@mui/material';
import { useCurrentUser } from '../hooks/UserContext';
import { ImdbLink, LetterboxdLink } from './externalServiceLinks';
import { PartialMovie } from '../common/types/base';
import { Movie } from '../db/entities';
import { callApi } from '../hooks/useApi';
import { MoviesApiResponse } from '../common/types/api';

interface MoviesTableProps {
  movies: PartialMovie[] | undefined;
  isLoading: boolean;
}

function MovieCard({ movie }: { movie: PartialMovie }) {
  const { user } = useCurrentUser();
  const sharedProps: Partial<ImageProps> = {
    height: 100,
    width: 66,
    layout: "responsive",
    alt: `${movie.title} Poster`
  };
  const poster = (movie.posterPath) ?
    <TMDBImage
      {...sharedProps}
      tmdbPath={movie.posterPath}
    /> :
    <Image {...sharedProps} src="/img/no-poster.png" alt="" />;
  
  const slug = movie.letterboxdSlug;

  return (
    <Box className="entryCard" sx={{ display: "flex", paddingBottom: "15px" }}>
      <Box width="80px" sx={{ paddingRight: "15px" }}>
        {poster}
      </Box>
      <Box>
        <Typography><b>{movie.title}</b> <ReleaseYear releaseDate={movie.releaseDate} /></Typography>
        <Box sx={{ display: "flex", py: 1 }}>
          <Box sx={{ marginRight: 1 }}>
            <LetterboxdLink slug={slug} />
          </Box>
          <Box sx={{ marginRight: 1 }}>
            <ImdbLink id={movie.imdbId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ReleaseYear({ releaseDate }: { releaseDate?: string }) {
  if (!releaseDate) {
    return null;
  }
  return <>({releaseDate.substring(0, 4)})</>;
}

export function MoviesTable({ movies = [], isLoading }: MoviesTableProps) {
  const getRowId = React.useCallback((row: PartialMovie) => row.id, []);
  
  return (
    <DisplayTable<PartialMovie>
      getRowId={getRowId}
      isLoading={isLoading}
      items={isLoading ? [] : movies}
      columns={[
        {
          name: 'ratings-card',
          renderCell: (movie) => <MovieCard movie={movie} />
        }
      ]}
      sx={{
        py: "10px",
        backgroundColor: "inherit",
        backgroundImage: "none",
        boxShadow: "none"
      }}
    />
  );
}