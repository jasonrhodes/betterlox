import { Autocomplete, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { SearchApiResponse } from '../../common/types/api';
import { Person } from '../../db/entities';
import { useRatingsFilters } from '../../hooks/GlobalFiltersContext';
import { useApi } from '../../hooks/useApi';

export function DirectorLookUp() {
  const [ratingsFilters, setRatingsFilters] = useRatingsFilters();
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [directorOptions, setDirectorOptions] = useState<Person[]>([]);
  const response = useApi<SearchApiResponse<Person[]>>(`/api/search?searchType=people&role=Director&name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);

  useEffect(() => {
    const filtered = response?.data.results?.filter((p) => !ratingsFilters.directors?.includes(p.id));
    setDirectorOptions(filtered || []);
  }, [response, ratingsFilters]);

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
        const { directors = [] } = ratingsFilters;
        if (person) {
          setRatingsFilters({ ...ratingsFilters, directors: [...directors, person.id ]})
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