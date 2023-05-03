import React from 'react';
import { StarRating } from './StarRating';
import { TMDBImage } from './images';
import Image, { ImageProps } from "next/legacy/image";
import { DisplayTable } from './DisplayTable';
import { Box, Typography } from '@mui/material';
import { useCurrentUser } from '../hooks/UserContext';
import { EntryApiResponse } from "../common/types/api";
import { AppLink } from './AppLink';
import { FavoriteRounded } from '@mui/icons-material';

interface EntriesTableProps {
  entries: EntryApiResponse[] | undefined;
  isLoading: boolean;
}

function EntryCard({ entry }: { entry: EntryApiResponse }) {
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
      alt={entry.movie.title + ' Poster'}
    /> :
    <Image {...sharedProps} src="/img/no-poster.png" alt="" />;
  
  const loxPath = (entry.movie?.letterboxdSlug || '').replace(/^\/film/, '/films/').replace('//', '/');
  return (
    <AppLink href={loxPath} underline="none" color="#ffffff">
      <Box className="entryCard" sx={{ display: "flex", padding: "10px", mb: 1, cursor: 'pointer', ['&:hover']: { backgroundColor: 'rgba(0,0,0,0.2)' }}}>
        <Box width="80px" sx={{ flexShrink: 0, paddingRight: "15px" }}>
          {poster}
        </Box>
        <Box>
          <Typography><b>{entry.movie?.title || entry.name}</b> ({entry.movie?.releaseDate.substring(0, 4)})</Typography>
          <Box>
            {entry.stars ? 
              <Box sx={{ marginBottom: "-7px" }}><StarRating color="secondary" score={entry.stars} /></Box> : 
              <Typography variant="caption" sx={{ my: 0.5 }}>Unrated</Typography>
            }
          </Box> 
          {/* {entry.date ? <Box><Typography sx={{ opacity: 0.6 }} variant="caption">{`${action} on ${(new Date(entry.date)).toLocaleDateString()}`}</Typography></Box> : null}
          {entry.sortId ? <Box><Typography sx={{ opacity: 0.6 }} variant="caption">Sort ID: {entry.sortId}</Typography></Box> : null} */}
          <Box sx={{ marginTop: '0.2em' }}>
            {entry.heart ? <Box><FavoriteRounded color="primary" fontSize="small" /></Box> : null}
          </Box> 
        </Box>
      </Box>
    </AppLink>
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