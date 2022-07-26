import React from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { ActorTableResult } from '../common/types/api';
import Link from 'next/link';
import { TMDBImage } from './images';

export interface ActorsTableProps {
  actors: ActorTableResult[];
}

export function ActorsTable({ actors }: ActorsTableProps) {
  if (!actors) {
    return null;
  }

  return (
    <DataGrid
      getRowId={(row) => row.actorId}
      sx={{
        width: '100%'
      }}
      rows={actors}
      columns={[
        {
          field: "profilePath",
          headerName: "",
          sortable: false,
          width: 40,
          align: "center",
          renderCell: ({ row, value }) => {
            return value
              ? <TMDBImage sx={{ height: '52px', width: 'auto' }} tmdbPath={value} />
              : null;
          }
        },
        {
          field: "name",
          headerName: "Name",
          width: 300,
          renderCell: ({ row, value }) => <Link href={`/stats/actors/${row.actorId}`}>{value}</Link>
        },
        {
          field: "countMoviesSeen",
          headerName: "Movies Seen",
          width: 150
        },
        {
          field: "avgRating",
          headerName: "Your Average Rating",
          width: 150,
          renderCell: ({ value }) => Math.round(value * 100) / 100
        }
      ]}
    />
  )
}