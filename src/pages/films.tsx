import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Grid } from '@mui/material';
import { callApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { FilmEntry } from '../db/entities';
import { useRouter } from 'next/router';
import { RatingsFilterControls } from '../components/ratings/RatingsFilterControls';
import { MobileRatingsFilterControls } from '../components/ratings/MobileRatingsFilterControls';
import { FilmEntryTabs } from '../components/ratings/FilmEntryTabs';
import { convertFiltersToQueryString } from '../lib/convertFiltersToQueryString';
import { useGlobalFilters } from '../hooks/GlobalFiltersContext';
import { EntriesApiResponse, EntryApiResponse } from '../common/types/api';

function PageContent({ userId }: { userId: number }) {
  const [unprocessedEntries, updateUnprocessedEntries] = useState<EntryApiResponse[]>([]);
  const { globalFilters, setGlobalFilters } = useGlobalFilters();
  const [isReloading, setIsReloading] = useState<boolean>(false);

  useEffect(() => {
    async function retrieve() {
      setIsReloading(true);
      const qs = convertFiltersToQueryString(globalFilters);
      const url = `/api/users/${userId}/entries?${qs}`;
      const response = await callApi<EntriesApiResponse>(url);
      updateUnprocessedEntries(response.data.entries);
      setIsReloading(false);
    }
    retrieve();
  }, [globalFilters, userId]);

  return (
    <>
      <Box sx={{ position: "absolute", top: 15, right: 15 }}>
        <MobileRatingsFilterControls
          appliedFilters={globalFilters}
          applyFilters={setGlobalFilters} 
        />
      </Box>
      <Box sx={{ height: 600 }}>
        <Grid container spacing={10} alignItems="flex-start">
          <Grid item xs={12} md={6} lg={5}>
            <FilmEntryTabs 
              unprocessedEntries={unprocessedEntries} 
              filters={globalFilters}
              isReloading={isReloading}
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

const EntriesPage: NextPage = () => {
  const router = useRouter();
  return (
    <UserPageTemplate title="My Films">
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

export default EntriesPage;