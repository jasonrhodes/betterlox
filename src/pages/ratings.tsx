import React from 'react';
import type { NextPage } from 'next';
import { Box, LinearProgress } from '@mui/material';
import { GetRatingsForUserResponse } from '../common/types/api';
import { useApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { RatingsTable } from '../components/RatingsTable';

const RatingsPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Ratings">
      {(userContext) => {
        const { response, errorStatus } = useApi<GetRatingsForUserResponse>(
          `/api/users/${userContext.user.id}/ratings`
        );
        const errorContent = <p>An error occurred while loading ratings ({errorStatus})</p>;
        return (
          <Box sx={{ height: 600 }}>
            {response ? 
              <RatingsTable ratings={response.ratings} /> : 
              errorStatus ? 
                errorContent : <LinearProgress />
            }
          </Box>
        );
      }}
    </UserPageTemplate>
  );
};

export default RatingsPage;