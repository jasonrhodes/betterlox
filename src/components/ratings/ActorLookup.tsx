import { Autocomplete, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { PeopleApiResponse, RatingsFilters } from '../../common/types/api';
import { Person } from '../../db/entities';
import { useApi } from '../../hooks/useApi';

export function ActorLookUp({ filters, onChange }: { filters: RatingsFilters, onChange: (filters: RatingsFilters) => void }) {
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [actorOptions, setActorOptions] = useState<Person[]>([]);
  const response = useApi<PeopleApiResponse>(`/api/people?name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);

  useEffect(() => {
    const filtered = response?.data.people.filter((p) => !filters.actors?.includes(p.id));
    setActorOptions(filtered || []);
  }, [response, filters]);

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
      options={actorOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search for an actor"
        />
      )}
      filterOptions={(x) => x}
    />
  )
}