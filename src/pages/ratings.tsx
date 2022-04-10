import React from 'react';
import type { NextPage } from 'next';
import { Box, LinearProgress, Container, Typography, Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import { GetRatingsForUserResponse } from '../common/types/api';
import { useApi } from '../hooks/useApi';
import { StarRating } from '../components/StarRating';
import { PageTemplate } from '../components/PageTemplate';
import { BasicImage } from '../components/images';

const RatingsPage: NextPage = () => {
  const { response, errorStatus } = useApi<GetRatingsForUserResponse>("/api/users/1/ratings");
  const errorContent = <p>An error occurred while loading ratings ({errorStatus})</p>;
  return (
    <PageTemplate title="My Ratings">
      <Box sx={{ height: 600 }}>
        {response ? 
          <RatingsTable response={response} /> : 
          errorStatus ? 
            errorContent : <LinearProgress />
        }
      </Box>
    </PageTemplate>
  );
};

function RatingsTable({ response }: { response: GetRatingsForUserResponse | undefined }) {
  if (!response) {
    return null;
  }

  return (
    <DataGrid
      getRowId={(row) => row.title + '-' + row.year}
      rowHeight={100}
      sx={{
        width: '100%'
      }}
      rows={response.ratings}
      columns={[
        {
          field: "poster_path",
          headerName: "",
          sortable: false,
          align: "left",
          width: 80,
          renderCell: ({ row, value }) => {
            return value
              ? <BasicImage sx={{ height: '100px', width: 'auto' }} path={value} />
              : null;
          }
        },
        {
          field: "title",
          headerName: "Title",
          flex: 150
        },
        {
          field: "rating",
          headerName: "Rating",
          width: 150,
          renderCell: ({ value }) => <StarRating rating={value} style={{

          }} />
        },
        {
          field: "date",
          headerName: "Date",
          width: 150
        }
      ]}
    />
  )
}

export default RatingsPage;