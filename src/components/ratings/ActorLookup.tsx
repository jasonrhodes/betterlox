import { Autocomplete, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { PeopleApiResponse, RatingsFilters } from '../../common/types/api';
import { Person } from '../../db/entities';
import { useRatingsFilters } from '../../hooks/GlobalFiltersContext';
import { useApi } from '../../hooks/useApi';

export function ActorLookUp() {
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [actorOptions, setActorOptions] = useState<Person[]>([]);
  const response = useApi<PeopleApiResponse>(`/api/people?role=actor&name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);
  const [ratingsFilters, setRatingsFilters] = useRatingsFilters();

  useEffect(() => {
    const filtered = response?.data.people.filter((p) => !ratingsFilters.actors?.includes(p.id));
    setActorOptions(filtered || []);
  }, [response, ratingsFilters]);

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
        const { actors = [] } = ratingsFilters;
        if (person) {
          setRatingsFilters({ ...ratingsFilters, actors: [...actors, person.id ]})
        }
        updateSearchValue('');
      }}
      onInputChange={(e, value) => {
        updateSearchValue(value);
      }}
      getOptionLabel={(option) => option.name}
      options={actorOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter by actor"
        />
      )}
      filterOptions={(x) => x}
    />
  )
}