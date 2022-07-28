import React from 'react';
import { StarRating } from '../components/StarRating';
import { TMDBImage } from '../components/images';
import { Rating } from '../db/entities';
import Image, { ImageProps } from 'next/image';
import { DisplayTable } from './DisplayTable';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import { useCurrentUser } from '../hooks/UserContext';
import { Article } from '@mui/icons-material';

interface RatingsTableProps {
  ratings: Rating[] | undefined;
}

function RatingCard({ rating }: { rating: Rating }) {
  const { user } = useCurrentUser();
  const sharedProps: Partial<ImageProps> = {
    height: 100,
    width: 66,
    layout: "responsive",
    alt: `${rating.name} Poster`
  };
  const poster = (rating.movie?.posterPath) ?
    <TMDBImage
      {...sharedProps}
      tmdbPath={rating.movie.posterPath}
    /> :
    <Image {...sharedProps} src="/img/no-poster.png" alt="" />;
  
  const ICON_SIZE = 15;
  const slug = rating.movie?.letterboxdSlug;
  return (
    <Box className="ratingCard" sx={{ display: "flex", paddingBottom: "15px" }}>
      <Box width="80px" sx={{ paddingRight: "10px" }}>
        {poster}
      </Box>
      <Box>
        <Typography><b>{rating.movie?.title || rating.name}</b></Typography>
        <Box sx={{ marginBottom: "-7px" }}><StarRating color="primary" score={rating.stars} /></Box>
        <Box><Typography variant="caption">{(new Date(rating.date)).toLocaleDateString()}</Typography></Box>
        <Box sx={{ display: "flex" }}>
          <Box sx={{ marginRight: "5px" }}>
            <a target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user?.username}${slug}`}>
              <Image height={ICON_SIZE} width={ICON_SIZE} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
            </a>
          </Box>
          <Box sx={{ marginRight: "5px" }}>
            <a target="_blank" rel="noreferrer" href={`https://www.imdb.com/title/${rating.movie?.imdbId}`}>
              <Image height={ICON_SIZE} width={ICON_SIZE} src="/img/imdb-icon.png" alt="Letterboxd.com logo" />
            </a>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function RatingsTable({ ratings = [] }: RatingsTableProps) {
  const getRowId = React.useCallback((row: typeof ratings[number]) => row.name + '-' + row.date, []);
  
  return (
    <DisplayTable<Rating>
      getRowId={getRowId}
      items={ratings}
      columns={[
        {
          name: 'ratings-card',
          renderCell: (rating) => <RatingCard rating={rating} />
        }
      ]}
      sx={{
        py: "10px",
        backgroundColor: "inherit",
        backgroundImage: "none"
      }}
    />
  );
}