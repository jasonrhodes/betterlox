import React, { useEffect, useState } from 'react';
import { TMDBImage } from './images';
import Image, { ImageProps } from "next/image";
import { DisplayTable } from './DisplayTable';
import { Box, Typography } from '@mui/material';
import { ImdbLink, LetterboxdLink } from './externalServiceLinks';
import { PartialMovie } from "@rhodesjason/loxdb/dist/common/types/base";
import { AppLink } from './AppLink';

interface MoviesTableProps {
  movies: PartialMovie[] | undefined;
  isLoading: boolean;
}

function MovieCard({ movie }: { movie: PartialMovie }) {
  // console.log('movie card', movie.title, movie);
  const sharedProps: Pick<ImageProps, "height" | "width" | "layout" | "alt"> = {
    height: 100,
    width: 66,
    layout: "responsive",
    alt: `${movie.title} Poster`
  };
  const poster = (movie.posterPath) ? (
    <Box width="80px" sx={{ flexShrink: 0, paddingRight: "15px" }}>
      <TMDBImage
        {...sharedProps}
        tmdbPath={movie.posterPath}
      />
    </Box>
   ) : (
    <Image {...sharedProps} src="/img/no-poster.png" alt="" />
   );

  const title = (
    <Typography><b>{movie.title}</b> <ReleaseYear releaseDate={movie.releaseDate} /></Typography>
  );
  
  const slug = movie.letterboxdSlug;

  return (
    <Box className="entryCard" sx={{ display: "flex", paddingBottom: "15px" }}>
      {slug ? (
        <AppLink href={slug.replace(/\/film\//, '/films/')} color="#FFFFFF" underline="none">
          {poster}
        </AppLink>
      ) : poster}
      <Box>
        {slug ? (
          <AppLink href={slug.replace(/\/film\//, '/films/')} color="#FFFFFF" underline="none">
            {title}
          </AppLink>
        ) : title}
        <Box sx={{ display: "flex", py: 1 }}>
          <Box sx={{ marginRight: 1.5 }}>
            <LetterboxdLink slug={slug} title={movie.title} releaseDate={movie.releaseDate} />
          </Box>
          <Box sx={{ marginRight: 1 }}>
            <ImdbLink id={movie.imdbId} title={movie.title} releaseDate={movie.releaseDate} />
          </Box>
          {slug ? (
            <Box sx={{ position: 'relative', top: '-4px' }}>
              <AppLink href={slug.replace(/\/film\//, '/films/')} color="#FFFFFF" underline="none">
                <Image height={28} width={28} src="/img/logo/apple-touch-icon-180x180.png" alt="Betterlox logo" />
              </AppLink>
            </Box>
          ): null}
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