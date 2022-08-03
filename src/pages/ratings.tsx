import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { Box, Chip, FormControl, TextField, InputLabel, LinearProgress, MenuItem, Select, Grid, Typography, Button, Dialog, Paper, Autocomplete } from '@mui/material';
import { GetPeopleResponse, GetRatingsForUserResponse, RatingsFilters } from '../common/types/api';
import { callApi, useApi } from '../hooks/useApi';
import { UserPageTemplate } from '../components/PageTemplate';
import { RatingsTable } from '../components/RatingsTable';
import { Person, Rating } from '../db/entities';
import { ArrowDownward, ArrowUpward, Close, FilterAlt, Tune } from '@mui/icons-material';
import { useRouter } from 'next/router';

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function applyTitleFilter(filterString: string, ratings?: Rating[]) {
  if (!ratings) {
    return [];
  }
  if (filterString.length === 0) {
    return ratings;
  }
  return ratings.filter((r) => {
    const spacesReplaced = filterString.replace(' ', '.*')
    const regexp = new RegExp(`.*${spacesReplaced}.*`, 'i');
    return regexp.test(r.name);
  });
}

type SortBy = 'date' | 'stars' | 'movie.title';
type SortDir = 'ASC' | 'DESC';

function applySort(sortBy: SortBy, sortDir: SortDir, ratings: Rating[]) {
  if (!Array.isArray(ratings)) {
    return [];
  }
  const sorted = ratings.sort((a, b) => {
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
          return a.movie?.title.localeCompare(b.movie?.title);
        } else {
          return a.movie?.title.localeCompare(b.movie?.title) * -1;
        }
    }
  });
  return sorted;
}

function convertFiltersToQueryString(filters: RatingsFilters) {
  const keys = Object.keys(filters) as Array<keyof RatingsFilters>;
  const queries = keys.reduce<string[]>((queries, key) => {
    const values = filters[key];
    if (!values) {
      return queries;
    }
    if (Array.isArray(values)) {
      queries.push(`${key}=${values.join(',')}`);
    } else {
      queries.push(`${key}=${values}`);
    }
    return queries;
  }, []);

  return queries.join('&');
}

function PageContent({ userId }: { userId: number }) {
  const [unprocessedRatings, updateUnprocessedRatings] = useState<Rating[]>([]);
  const [processedRatings, updateRatings] = useState<Rating[]>([]);
  const [titleFilter, updateTitleFilter] = useState<string>('');
  const [filters, updateFilters] = useState<RatingsFilters>({});
  const [show, setShow] = React.useState<"all" | number>(100);
  const [sortBy, setSortBy] = React.useState<SortBy>("date");
  const [sortDir, setSortDir] = React.useState<SortDir>("DESC");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(true);

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
        <TextField size="small" value={titleFilter} sx={{ display: { xs: 'none', md: 'inline-flex' }, marginRight: '10px' }} placeholder="Filter by title" onChange={handleTitleFilterChange} />
        <MobileRatingsFilterControls
          currentFilters={filters}
          onChange={updateFilters} 
        />
      </Box>
      <Grid container spacing={2} alignItems="flex-start">
        <Grid item xs={12} md={6} lg={5}>
          <RatingsTable ratings={processedRatings} />
        </Grid>
        <Grid item xs={0} md={6} lg={7} sx={{ display: { xs: 'none', md: 'inherit' } }}>
          <RatingsFilterControls filters={filters} onChange={updateFilters} />
        </Grid>
      </Grid>
    </Box>
  );
}

function RatingsFilterControls({ filters, onChange }: { filters: RatingsFilters, onChange: (filters: RatingsFilters) => void }) {
  return (
    <Grid item container spacing={2} sx={{ paddingBottom: 5 }}>
      <Grid item xs={12}>
        <Typography variant="body1"><b>Advanced Filters</b></Typography>
      </Grid>
      <Grid item xs={12}>
        <CurrentFilters filters={filters} onChange={onChange} />
      </Grid>
      <Grid item xs={12}>
        <ActorLookUp filters={filters} onChange={onChange} />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" onClick={() => onChange({})}>Clear Filters</Button>
      </Grid>
    </Grid>
  )
}

function ActorLookUp({ filters, onChange }: { filters: RatingsFilters, onChange: (filters: RatingsFilters) => void }) {
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const response = useApi<GetPeopleResponse>(`/api/people?name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);

  return (
    <Autocomplete
      id="actor-search"
      sx={{ width: 300 }}
      open={open}
      value={null}
      inputValue={searchValue}
      clearOnBlur={true}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      onChange={(e, person) => {
        const { actors = [] } = filters;
        if (person) {
          onChange({ ...filters, actors: [...actors, person.id ]})
        }
        updateSearchValue('');
      }}
      onInputChange={(e, value) => {
        updateSearchValue(value);
      }}
      getOptionLabel={(option) => option.name}
      options={response?.data.people || []}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for an actor by name"
        />
      )}
      filterOptions={(x) => x}
    />
  )
}

function useGetPeople(ids?: number[]) {
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    async function retrieve() {
      if (typeof ids === "undefined" || ids.length === 0) {
        setPeople([]);
      } else {
        const response = await callApi<GetPeopleResponse>(`/api/people?ids=${ids.join(',')}`);
        setPeople(response?.data?.people || []);
      }
    }
    retrieve();
  }, [ids]);
  
  
  return people;
}

function CurrentFilters({
  filters,
  onChange
}: {
  filters: RatingsFilters;
  onChange: (filters: RatingsFilters) => void;
}) {
  const searchedActors = useGetPeople(filters.actors);
  const { actors = [] } = filters;
  return (
    <Box>
      {searchedActors.map(person => <Chip key={person.name} icon={<FilterAlt />} label={person.name} onDelete={() => onChange({ ...filters, actors: actors.filter(a => a !== person.id) })} />)}
    </Box>
  )
}

function MobileRatingsFilterControls({
  currentFilters,
  onChange
}: {
  currentFilters: RatingsFilters;
  onChange: (filters: RatingsFilters) => void;
}) {
  const [updatedFilters, setUpdatedFilters] = useState<RatingsFilters>(currentFilters);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleUpdate = () => {
    onChange(updatedFilters);
    setIsOpen(false);
  }
  const handleCancel = () => {
    setIsOpen(false);
  }
  return (
    <>
      <Box sx={{ cursor: 'pointer', display: { xs: 'inline-flex', md: 'none' }, verticalAlign: 'middle', marginRight: '10px' }}>
        <Tune onClick={() => setIsOpen(true) } />
      </Box>
      <Dialog
        fullScreen
        open={isOpen}
        PaperProps={{ sx: { backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
      >
        <Grid container spacing={4}>
          <RatingsFilterControls filters={updatedFilters} onChange={setUpdatedFilters} />
          {
            (currentFilters !== updatedFilters) ?
              <Grid item><Button onClick={() => handleUpdate()}>Apply Filters</Button></Grid> :
              null
          }
          <Grid item><Button onClick={() => handleCancel()}>Cancel</Button></Grid>
        </Grid>
      </Dialog>
    </>
  )
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