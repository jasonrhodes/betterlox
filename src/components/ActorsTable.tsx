import React from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { ActorResult } from '../common/types/api';
import Link from './Link';
import { BasicImage } from './images';

export interface ActorsTableProps {
  actors: ActorResult[] | undefined;
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
              ? <BasicImage sx={{ height: '52px', width: 'auto' }} path={value} />
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