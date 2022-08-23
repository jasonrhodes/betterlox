import { Autocomplete, SxProps, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CollectionsApiResponse, RatingsFilters } from '../../common/types/api';
import { Collection } from '../../db/entities';
import { useRatingsFilters } from '../../hooks/GlobalFiltersContext';
import { ExternalApiResponse, useApi } from '../../hooks/useApi';

interface HasId {
  id: number;
}

interface HasResults<T> {
  results: T[];
}

export function RatingsFilterFieldLookup<T extends HasId, A extends HasResults<T>>({ 
  id,
  inputLabel,
  filterKey,
  sx,
  getOptionsApiEndpoint,
  filterResponse,
  isOptionEqualToValue,
  getOptionLabel
}: { 
  id: string;
  inputLabel: string;
  filterKey: keyof RatingsFilters;
  sx: SxProps;
  getOptionsApiEndpoint: (searchValue: string) => string; 
  filterResponse: (response: ExternalApiResponse<A>) => T[];
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getOptionLabel?: (option: T) => string;
}) {
  const [ratingsFilters, setRatingsFilters] = useRatingsFilters();
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [options, setOptions] = useState<T[]>([]);
  // `/api/collections?name=${encodeURIComponent(searchValue)}&limit=100`
  const response = useApi<A>(getOptionsApiEndpoint(searchValue), [searchValue]);

  useEffect(() => {
    if (response === null) {
      // TODO: Should we return and ignore here or set to empty [] first?
      return;
    }
    const existing = ratingsFilters[filterKey] || [];
    const filtered = response?.data.results.filter((r) => Array.isArray(existing) && !existing.includes(r.id) )
    setOptions(filtered);
  }, [response, ratingsFilters]);

  return (
    <Autocomplete
      id={id}
      sx={sx}
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
      isOptionEqualToValue={isOptionEqualToValue}
      onChange={(e, incoming) => {
        const existing = ratingsFilters[filterKey] || [];
        if (incoming) {
          setRatingsFilters({ ...ratingsFilters, [filterKey]: [...existing, incoming.id ]})
        }
        updateSearchValue('');
      }}
      onInputChange={(e, value) => {
        updateSearchValue(value);
      }}
      getOptionLabel={getOptionLabel}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={inputLabel}
        />
      )}
      filterOptions={(x) => x}
    />
  )
}