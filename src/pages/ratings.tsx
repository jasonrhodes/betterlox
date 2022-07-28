import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Chip, FormControl, Input, InputLabel, LinearProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { GetRatingsForUserResponse } from '../common/types/api';
import { useApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { RatingsTable } from '../components/RatingsTable';
import { Rating } from '../db/entities';
import { ArrowDownward, ArrowUpward, Tune } from '@mui/icons-material';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function applyTitleFilter(filterString: string, ratings: Rating[]) {
  return ratings.filter((r) => {
    const spacesReplaced = filterString.replace(' ', '.*')
    const regexp = new RegExp(`.*${spacesReplaced}.*`, 'i');
    return regexp.test(r.name);
  });
}

type SortBy = 'date' | 'stars' | 'movie.title';
type SortDir = 'ASC' | 'DESC';

function applySort(sortBy: SortBy, sortDir: SortDir, ratings: Rating[]) {
  return ratings.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        if (sortDir === 'ASC') {
          return a.date < b.date ? -1 : 1;
        } else {
          return a.date > b.date ? -1 : 1;
        }
      case 'stars':
        if (sortDir === 'ASC') {
          return a.stars < b.stars ? -1 : 1;
        } else {
          return a.stars > b.stars ? -1 : 1;
        }
      case 'movie.title':
        if (sortDir === 'ASC') {
          return a.movie?.title < b.movie?.title ? -1 : 1;
        } else {
          return a.movie?.title > b.movie?.title ? -1 : 1;
        }
    }
  })
}

function PageContent({ userId }: { userId: number }) {
  const [processedRatings, updateRatings] = useState<Rating[]>([]);
  const [titleFilter, updateTitleFilter] = useState<string>('');
  const { response, errorStatus } = useApi<GetRatingsForUserResponse>(
    `/api/users/${userId}/ratings`
  );
  const errorContent = <p>An error occurred while loading ratings ({errorStatus})</p>;
  const [show, setShow] = React.useState<"all" | number>(100);
  const [sortBy, setSortBy] = React.useState<SortBy>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("DESC");
  const [activeControls, setActiveControls] = React.useState([]);

  useEffect(() => {
    if (!response || !response.ratings) {
      return;
    }
    let updated = response.ratings;
    if (titleFilter.length > 0) {
      updated = applyTitleFilter(titleFilter, response.ratings);
    }
    updated = applySort(sortBy, sortDir, updated);
    if (show !== "all") {
      updated = updated.slice(0, show);
    }
    updateRatings(updated);
  }, [response, titleFilter, show, sortBy, sortDir]);

  const handleTitleFilterChange = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>>((event) => {
    updateTitleFilter(escapeRegExp(event.target.value));
  }, []);

  const handleShowChange = React.useCallback((event) => {
    const { value } = event.target;
    console.log('handle show change', value);
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

  const handleOpenControls = React.useCallback(() => {
    console.log("Tried to open controls ha ha ha");
  }, []);

  return (
    <Box sx={{ height: 600 }}>
      <Box sx={{ marginBottom: '20px' }}>
        <Chip color="secondary" label={`${processedRatings.length} of ${response?.ratings.length}`} sx={{ marginRight: '10px' }} />
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
          <ArrowUpward color={sortDir === "ASC" ? "secondary" : "disabled"} />
          <ArrowDownward color={sortDir === "DESC" ? "secondary" : "disabled"} />
        </Box>
        <Input sx={{ display: { xs: 'none', md: 'inline-flex' }, marginRight: '10px' }} placeholder="Filter by title" onChange={handleTitleFilterChange} />
        <Box sx={{ cursor: 'pointer', display: 'inline-flex', verticalAlign: 'middle', marginRight: '10px' }} onClick={handleOpenControls}>
          <Tune color={activeControls.length > 0 ? "secondary" : "disabled"} />
        </Box>
      </Box>
      <Box>
        {response ? 
          <RatingsTable ratings={processedRatings} /> : 
          errorStatus ? 
            errorContent : <LinearProgress />
        }
      </Box>
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