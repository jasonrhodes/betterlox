import React from 'react';
import { StarRating } from '../components/StarRating';
import { TMDBImage } from '../components/images';
import { Rating } from '../db/entities';
import Image, { ImageProps } from 'next/image';
import { DisplayTable } from './DisplayTable';
import { Box, Tooltip, Typography } from '@mui/material';
import { useCurrentUser } from '../hooks/UserContext';

const ICON_SIZE = 20;
interface RatingsTableProps {
  ratings: Rating[] | undefined;
}

function LetterboxdLink({ username, slug }: { username?: string, slug?: string }) {
  if (!username || !slug) {
    return (
      <Tooltip title="Movie data is still loading..." arrow>
        <Box>
          <Image height={ICON_SIZE} width={ICON_SIZE} style={{ opacity: 0.4 }} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }
  return (
    <a target="_blank" rel="noreferrer" href={`https://letterboxd.com/${username}${slug}`}>
      <Image height={ICON_SIZE} width={ICON_SIZE} src="/img/letterboxd-icon-2.webp" alt="Letterboxd.com logo" />
    </a>
  );
}

function ImdbLink({ id }: { id?: string }) {
  if (!id) {
    return (
      <Tooltip title="Movie data is still loading..." arrow>
        <Box>
          <Image height={ICON_SIZE} width={ICON_SIZE} style={{ opacity: 0.4 }} src="/img/imdb-icon.png" alt="Letterboxd.com logo" />
        </Box>
      </Tooltip>
    )
  }
  return (
    <a target="_blank" rel="noreferrer" href={`https://www.imdb.com/title/${id}`}>
      <Image height={ICON_SIZE} width={ICON_SIZE} src="/img/imdb-icon.png" alt="IMDb.com logo" />
    </a>
  );
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
        <Typography><b>{rating.movie?.title || rating.name}</b></Typography>
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