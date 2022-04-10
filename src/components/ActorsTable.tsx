import React, { useState } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { ActorResult, GetActorsForUserResponse } from '../common/types/api';
import Link from './Link';
import CreditControls from './CreditControls';
import { useApi } from '../hooks/useApi';
import { Box, LinearProgress } from '@mui/material';
import { BasicImage } from './images';

export interface ActorsTableProps {
  response: GetActorsForUserResponse | undefined;
}

export function ActorsTable({ response }: ActorsTableProps) {
  if (!response) {
    return null;
  }

  return (
    <DataGrid
      getRowId={(row) => row.profile_path || row.name!}
      sx={{
        width: '100%'
      }}
      rows={response.actors}
      columns={[
        {
          field: "profile_path",
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
          renderCell: ({ row, value }) => <Link href={`/stats/actors/${row.id}`}>{value}</Link>
        },
        {
          field: "count",
          headerName: "Movies Seen",
          width: 150
        },
        {
          field: "avg_rating",
          headerName: "Your Average Rating",
          width: 150,
          renderCell: ({ value }) => Math.round(value * 100) / 100
        }
      ]}
    />
  )
}

export function ControlledActorsTable() {
  const [castOrderThreshold, setCastOrderThreshold] = useState(15);
  const url = `/api/users/1/actors?castOrderThreshold=${castOrderThreshold}`;
  const { response, errorStatus } = useApi<GetActorsForUserResponse>(url, [castOrderThreshold]);
  const errorContent = <p>An error occurred while loading actors ({errorStatus})</p>;
  return (
    <Box maxWidth="lg" sx={{ height: 600 }}>
      <CreditControls castOrderThreshold={castOrderThreshold} setCastOrderThreshold={setCastOrderThreshold} />
      {response ?
        <ActorsTable response={response} /> : 
        errorStatus ? 
          errorContent : 
          <LinearProgress />
      }
    </Box>
  );
}