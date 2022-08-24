import React from 'react';
import { StarRating } from '../components/StarRating';
import { TMDBImage } from '../components/images';
import { Rating } from '../db/entities';
import Image, { ImageProps } from 'next/image';
import { DisplayTable } from './DisplayTable';
import { Box, Tooltip, Typography } from '@mui/material';
import { useCurrentUser } from '../hooks/UserContext';
import { ImdbLink, LetterboxdLink } from './externalServiceLinks';


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
  
  const slug = rating.movie?.letterboxdSlug;
  return (
    <Box className="ratingCard" sx={{ display: "flex", paddingBottom: "15px" }}>
      <Box width="80px" sx={{ paddingRight: "15px" }}>
        {poster}
      </Box>
      <Box>
        <Typography><b>{rating.movie?.title || rating.name}</b> ({rating.movie.releaseDate.substring(0, 4)})</Typography>
        <Box sx={{ marginBottom: "-7px" }}><StarRating color="primary" score={rating.stars} /></Box>
        <Box><Typography variant="caption">{(new Date(rating.date)).toLocaleDateString()}</Typography></Box>
        <Box sx={{ display: "flex", py: 1 }}>
          <Box sx={{ marginRight: 1 }}>
            <LetterboxdLink username={user?.username} slug={slug} />
          </Box>
          <Box sx={{ marginRight: 1 }}>
            <ImdbLink id={rating.movie?.imdbId} />
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