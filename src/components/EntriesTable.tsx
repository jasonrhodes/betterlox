import React from 'react';
import { StarRating } from './StarRating';
import { TMDBImage } from './images';
import Image, { ImageProps } from 'next/image';
import { DisplayTable } from './DisplayTable';
import { Box, Typography } from '@mui/material';
import { useCurrentUser } from '../hooks/UserContext';
import { ImdbLink, LetterboxdLink } from './externalServiceLinks';
import { EntryApiResponse } from '../common/types/api';

interface EntriesTableProps {
  entries: EntryApiResponse[] | undefined;
  isLoading: boolean;
}

function EntryCard({ entry }: { entry: EntryApiResponse }) {
  const { user } = useCurrentUser();
  const sharedProps: Partial<ImageProps> = {
    height: 100,
    width: 66,
    layout: "responsive",
    alt: `${entry.name} Poster`
  };
  const poster = (entry.movie?.posterPath) ?
    <TMDBImage
      {...sharedProps}
      tmdbPath={entry.movie.posterPath}
    /> :
    <Image {...sharedProps} src="/img/no-poster.png" alt="" />;
  
  const slug = entry.movie?.letterboxdSlug;
  return (
    <Box className="entryCard" sx={{ display: "flex", paddingBottom: "15px" }}>
      <Box width="80px" sx={{ paddingRight: "15px" }}>
        {poster}
      </Box>
      <Box>
        <Typography><b>{entry.movie?.title || entry.name}</b> ({entry.movie?.releaseDate.substring(0, 4)})</Typography>
        <Box>
          {entry.stars ? 
            <Box sx={{ marginBottom: "-7px" }}><StarRating color="primary" score={entry.stars} /></Box> : 
            <Typography variant="caption" sx={{ my: 0.5 }}>Unrated</Typography>
          }
        </Box> 
        {entry.dateRated ? <Box><Typography variant="caption">{(new Date(entry.dateRated)).toLocaleDateString()}</Typography></Box> : null}
        <Box sx={{ display: "flex", py: 1 }}>
          <Box sx={{ marginRight: 1 }}>
            <LetterboxdLink username={user?.username} slug={slug} />
          </Box>
          <Box sx={{ marginRight: 1 }}>
            <ImdbLink id={entry.movie?.imdbId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function EntriesTable({ entries = [], isLoading }: EntriesTableProps) {
  const getRowId = React.useCallback((row: typeof entries[number]) => row.name + '-' + row.movie?.releaseDate, []);
  
  return (
    <DisplayTable<EntryApiResponse>
      getRowId={getRowId}
      isLoading={isLoading}
      items={isLoading ? [] : entries}
      columns={[
        {
          name: 'ratings-card',
          renderCell: (entry) => <EntryCard entry={entry} />
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