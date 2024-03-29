import { Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React from 'react';
import { RatedMovie, RatedTmdbCast } from "@rhodesjason/loxdb/dist/common/types/db";
import CreditControls from './CreditControls';
import { TMDBImage } from './images';

export interface MoviesForActorTableProps {
  castOrderThreshold: number;
  setCastOrderThreshold: (threshold: number) => void;
  credits: RatedTmdbCast[];
  ratings?: RatedMovie[];
}

export const MoviesForActorTable: React.FC<MoviesForActorTableProps> = ({ credits, setCastOrderThreshold, castOrderThreshold }) => {
  return (
    <Box maxWidth="lg" sx={{ height: 600 }}>
      <CreditControls castOrderThreshold={castOrderThreshold} setCastOrderThreshold={setCastOrderThreshold} />
      <Table credits={credits} />
    </Box>
  );
};

function Table({ credits }: { credits: RatedTmdbCast[] }) {
  return (
    <DataGrid
      getRowId={(row: typeof credits[0]) => row.credit_id || row.name || row.id || 0}
      sx={{
        width: '100%'
      }}
      rows={credits}
      columns={[
        {
          field: "poster_path",
          headerName: "",
          sortable: false,
          width: 40,
          align: "center",
          renderCell: ({ value, row }) => {
            return value
              ? <TMDBImage alt={row.name + ' poster'} sx={{ height: '52px', width: 'auto' }} size="small" tmdbPath={value} />
              : null;
          }
        },
        {
          field: "title",
          headerName: "Title",
          width: 500
        },
        {
          field: "rating",
          headerName: "My Rating",
          width: 150
        },
        {
          field: "order",
          headerName: "Cast Order",
          width: 150
        }
      ]}
    />
  )
}