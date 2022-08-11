import { Autocomplete, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { PeopleApiResponse, RatingsFilters } from '../../common/types/api';
import { Person } from '../../db/entities';
import { useApi } from '../../hooks/useApi';

export function DirectorLookUp({ filters, onChange }: { filters: RatingsFilters, onChange: (filters: RatingsFilters) => void }) {
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [directorOptions, setDirectorOptions] = useState<Person[]>([]);
  const response = useApi<PeopleApiResponse>(`/api/people?role=Director&name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);

  useEffect(() => {
    const filtered = response?.data.people.filter((p) => !filters.directors?.includes(p.id));
    setDirectorOptions(filtered || []);
  }, [response, filters]);

  return (
    <Autocomplete
      id="director-search"
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
        const { directors = [] } = filters;
        if (person) {
          onChange({ ...filters, directors: [...directors, person.id ]})
        }
        updateSearchValue('');
      }}
      onInputChange={(e, value) => {
        updateSearchValue(value);
      }}
      getOptionLabel={(option) => option.name}
      options={directorOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter by director"
        />
      )}
      filterOptions={(x) => x}
    />
  )
}