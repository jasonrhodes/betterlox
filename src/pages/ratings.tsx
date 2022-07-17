import React from 'react';
import type { NextPage } from 'next';
import { Box, LinearProgress } from '@mui/material';
import { GetRatingsForUserResponse } from '../common/types/api';
import { useApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { RatingsTable } from '../components/RatingsTable';

function PageContent({ userId }: { userId: number }) {
  const { response, errorStatus } = useApi<GetRatingsForUserResponse>(
    `/api/users/${userId}/ratings`
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
}

const RatingsPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Ratings">
      {(userContext) => {
        if (!userContext.user) {
          return null;
        }
        return <PageContent userId={userContext.user.id} />
      }}
    </UserPageTemplate>
  );
};

export default RatingsPage;