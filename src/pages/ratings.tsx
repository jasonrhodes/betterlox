import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Grid } from '@mui/material';
import { RatingsFilters } from '../common/types/api';
import { callApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { Rating } from '../db/entities';
import { useRouter } from 'next/router';
import { convertFiltersToQueryString } from '../components/ratings/helpers';
import { RatingsFilterControls } from '../components/ratings/RatingsFilterControls';
import { MobileRatingsFilterControls } from '../components/ratings/MobileRatingsFilterControls';
import { RatingsTabs } from '../components/ratings/RatingsTabs';

function PageContent({ userId }: { userId: number }) {
  const [unprocessedRatings, updateUnprocessedRatings] = useState<Rating[]>([]);
  const [filters, updateFilters] = useState<RatingsFilters>({});

  useEffect(() => {
    async function retrieve() {
      let url = `/api/users/${userId}/ratings`;
      if (filters) {
        url += `?${convertFiltersToQueryString(filters)}`;
      }
      const response = await callApi<{ ratings: Rating[] }>(url);
      updateUnprocessedRatings(response.data.ratings);
    }
    retrieve();
  }, [filters, userId]);

  return (
    <>
      <Box sx={{ position: "absolute", top: 15, right: 15 }}>
        <MobileRatingsFilterControls
          currentFilters={filters}
          onChange={updateFilters} 
        />
      </Box>
      <Box sx={{ height: 600 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={6} lg={5}>
            <RatingsTabs 
              unprocessedRatings={unprocessedRatings} 
              filters={filters}
            />
          </Grid>
          <Grid container item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'inherit' } }}>
            <Grid item xs={12}>
              <RatingsFilterControls filters={filters} onChange={updateFilters} />
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

const RatingsPage: NextPage = () => {
  const router = useRouter();
  return (
    <UserPageTemplate title="My Ratings">
      {(userContext) => {
        if (!userContext.user) {
          router.replace('/login');
          return null;
        }
        return <PageContent userId={userContext.user.id} />
      }}
    </UserPageTemplate>
  );
};

export default RatingsPage;