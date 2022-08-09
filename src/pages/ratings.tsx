import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Chip, FormControl, TextField, InputLabel, MenuItem, Select, Grid } from '@mui/material';
import { RatingsFilters } from '../common/types/api';
import { callApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { RatingsTable } from '../components/RatingsTable';
import { Rating } from '../db/entities';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { escapeRegExp } from '../lib/escapeRegex';
import { applySort, applyTitleFilter, convertFiltersToQueryString, SortBy, SortDir } from '../components/ratings/helpers';
import { RatingsFilterControls } from '../components/ratings/RatingsFilterControls';
import { MobileRatingsFilterControls } from '../components/ratings/MobileRatingsFilterControls';

function PageContent({ userId }: { userId: number }) {
  const [unprocessedRatings, updateUnprocessedRatings] = useState<Rating[]>([]);
  const [processedRatings, updateRatings] = useState<Rating[]>([]);
  const [titleFilter, updateTitleFilter] = useState<string>('');
  const [filters, updateFilters] = useState<RatingsFilters>({});
  const [show, setShow] = React.useState<"all" | number>(100);
  const [sortBy, setSortBy] = React.useState<SortBy>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("DESC");

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
  }, [filters]);

  useEffect(() => {
    // TODO: Look into how to avoid re-filtering the same data with the same filter
    const filtered = applyTitleFilter(titleFilter, unprocessedRatings);
    // TODO: Look into how to avoid re-sorting the same data over and over
    const filteredSorted = applySort(sortBy, sortDir, filtered);
    const filteredSortedSliced = show === "all" ? filteredSorted : filteredSorted.slice(0, show);

    updateRatings(filteredSortedSliced);
  }, [titleFilter, unprocessedRatings, sortBy, sortDir, show])

  const handleTitleFilterChange = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>>((event) => {
    updateTitleFilter(escapeRegExp(event.target.value));
  }, []);

  const handleShowChange = React.useCallback((event) => {
    const { value } = event.target;
    if (value === "all") {
      setShow("all");
    } else {
      setShow(Number(value));
    }
  }, []);

  const handleSortByChange = React.useCallback((event) => {
    const { value } = event.target;
    setSortBy(value);
  }, []);

  const handleSortDirClick = React.useCallback(() => {
    setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
  }, [sortDir]);

  return (
    <Box sx={{ height: 600 }}>
      <Box sx={{ marginBottom: '20px' }}>
        <Box sx={{ display: { xs: 'none', md: 'inline-block' }}}>
          <Chip 
            color="secondary" 
            label={`${processedRatings.length} of ${unprocessedRatings.length}`} 
            sx={{ marginRight: '10px' }} 
          />
        </Box>
        <FormControl sx={{ marginRight: "10px", minWidth: 80, verticalAlign: "middle" }} size="small">
          <InputLabel id="select-show-per-page-label">Show</InputLabel>
          <Select
            labelId="select-show-per-page"
            id="select-show-per-page"
            value={show}
            label="Show Per Page"
            autoWidth
            onChange={handleShowChange}
          >
            <MenuItem selected={show === 10} value={10}>{10}</MenuItem>
            <MenuItem selected={show === 50} value={50}>{50}</MenuItem>
            <MenuItem selected={show === 100} value={100}>{100}</MenuItem>
            <MenuItem selected={show === 250} value={250}>{250}</MenuItem>
            <MenuItem selected={show === 500} value={500}>{500}</MenuItem>
            <MenuItem selected={show === "all"} value={"all"}>{"all"}</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ marginRight: "10px", minWidth: 80, verticalAlign: "middle" }} size="small">
          <InputLabel id="select-sort-by-label">Sort By</InputLabel>
          <Select
            labelId="select-sort-by"
            id="select-sort-by"
            value={sortBy}
            label="Sort By"
            autoWidth
            onChange={handleSortByChange}
          >
            <MenuItem selected={sortBy === "date"} value="date">Date Rated</MenuItem>
            <MenuItem selected={sortBy === "stars"} value="stars">Your Rating</MenuItem>
            <MenuItem selected={sortBy === "movie.title"} value="movie.title">Movie Title</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ cursor: 'pointer', display: 'inline-flex', verticalAlign: "middle", marginRight: '10px' }} onClick={handleSortDirClick}>
          <ArrowUpward color={sortDir === "DESC" ? "secondary" : "disabled"} />
          <ArrowDownward color={sortDir === "ASC" ? "secondary" : "disabled"} />
        </Box>
        <MobileRatingsFilterControls
          currentFilters={filters}
          onChange={updateFilters} 
        />
      </Box>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={6} lg={5}>
          <FormControl sx={{ marginBottom: 2 }}>
            <TextField size="small" label="Quick Title Filter" value={titleFilter} onChange={handleTitleFilterChange} />
          </FormControl>
          <RatingsTable ratings={processedRatings} />
        </Grid>
        <Grid item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'inherit' } }}>
          <RatingsFilterControls filters={filters} onChange={updateFilters} />
        </Grid>
      </Grid>
    </Box>
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