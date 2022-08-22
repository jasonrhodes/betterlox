import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Grid } from '@mui/material';
import { RatingsFilters } from '../common/types/api';
import { callApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { Rating } from '../db/entities';
import { useRouter } from 'next/router';
import { RatingsFilterControls } from '../components/ratings/RatingsFilterControls';
import { MobileRatingsFilterControls } from '../components/ratings/MobileRatingsFilterControls';
import { RatingsTabs } from '../components/ratings/RatingsTabs';
import { convertFiltersToQueryString } from '../lib/convertFiltersToQueryString';
import { useRatingsFilters } from '../hooks/GlobalFiltersContext';

function PageContent({ userId }: { userId: number }) {
  const [unprocessedRatings, updateUnprocessedRatings] = useState<Rating[]>([]);
  const [ratingsFilters, setRatingsFilters] = useRatingsFilters();

  useEffect(() => {
    async function retrieve() {
      const qs = convertFiltersToQueryString<RatingsFilters>(ratingsFilters);
      const url = `/api/users/${userId}/ratings?${qs}`;
      const response = await callApi<{ ratings: Rating[] }>(url);
      updateUnprocessedRatings(response.data.ratings);
    }
    retrieve();
  }, [ratingsFilters, userId]);

  return (
    <>
      <Box sx={{ position: "absolute", top: 15, right: 15 }}>
        <MobileRatingsFilterControls
          appliedFilters={ratingsFilters}
          applyFilters={setRatingsFilters} 
        />
      </Box>
      <Box sx={{ height: 600 }}>
        <Grid container spacing={10} alignItems="flex-start">
          <Grid item xs={12} md={6} lg={5}>
            <RatingsTabs 
              unprocessedRatings={unprocessedRatings} 
              filters={ratingsFilters}
            />
          </Grid>
          <Grid container item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'inherit' } }}>
            <Grid item xs={12}>
              <RatingsFilterControls />
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