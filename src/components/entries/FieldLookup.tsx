import { Autocomplete, SxProps, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { GlobalFilters, SearchApiResponse, SearchCollection } from '../../common/types/api';
import { Person } from '../../db/entities';
import { useGlobalFilters } from '../../hooks/GlobalFiltersContext';
import { useApi } from '../../hooks/useApi';

type ChangeHandler<T> = (e: React.SyntheticEvent, option: T | null) => void;
interface AutocompleteFilterProps<T> {
  options: T[];
  inputValue: string;
  onChange: ChangeHandler<T>;
  onInputChange: ChangeHandler<string>;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getOptionLabel?: (option: T) => string;
}

function useAutocompleteFilterOptions<T extends Person | SearchCollection>({
  searchType,
  limit,
  filterKey,
  getId = (option) => ('id' in option ? option.id : option)
}: {
  searchType: string;
  limit?: number;
  filterKey: keyof GlobalFilters;
  getId?: (option: T) => number | string;
}): AutocompleteFilterProps<T> {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();
  const [inputValue, setInputValue] = useState<string>('');
  const [options, setOptions] = useState<T[]>([]);
  let apiEndpoint = `/api/search?searchType=${searchType}&limit=${limit}&role=${String(filterKey)}`;
  const encoded = encodeURIComponent(inputValue);
  apiEndpoint += `&name=${encoded}`;
  const response = useApi<SearchApiResponse<T[]>>(apiEndpoint, [inputValue, limit, filterKey]);

  useEffect(() => {
    if (response === null) {
      // TODO: Should we return and ignore here or set to empty [] first?
      return;
    }
    const existing = globalFilters[filterKey] as number[];
    const filtered = response?.data.results.filter((r) => {
      if (!Array.isArray(existing)) {
        return true;
      }
      return !existing.includes(r.id);
    });
    setOptions(filtered);
  }, [response, globalFilters, filterKey]);

  return {
    options,
    inputValue,
    onChange: (e, incoming) => {
      const existing = globalFilters[filterKey] || [];
      console.log('change', existing, incoming);
      if (incoming && Array.isArray(existing)) {
        setGlobalFilters({ ...globalFilters, [filterKey]: [...existing, incoming.id]})
      }
      setInputValue('');
    },
    onInputChange: (e, value) => {
      setInputValue(value || '');
    }
  }
}

export function RatingsFilterFieldLookup<T extends Person | SearchCollection>({ 
  searchType,
  filterKey,
  id = `filter-${String(filterKey)}`,
  inputLabel = `Filter by ${String(filterKey)}`,
  AutocompleteSx,
  limit = 100,
  getOptionLabel
}: { 
  id?: string;
  searchType: 'people' | 'collections';
  personRole?: string;
  filterKey: keyof GlobalFilters;
  inputLabel?: string;
  limit?: number;
  AutocompleteSx: SxProps;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getOptionLabel?: (option: T) => string;
}) {
  const acProps = useAutocompleteFilterOptions<T>({
    searchType,
    limit,
    filterKey
  });

  return (
    <FieldLookup 
      acProps={{
        ...acProps,
        getOptionLabel
      }}
      id={id}
      inputLabel={inputLabel}
      sx={AutocompleteSx}
    />
  )
}

function FieldLookup<T>({
  acProps,
  id,
  inputLabel,
  sx = {}
}: {
  acProps: AutocompleteFilterProps<T>;
  id: string;
  inputLabel: string;
  sx?: SxProps;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Autocomplete
      {...acProps}
      id={id}
      sx={sx}
      open={isOpen}
      value={null}
      clearOnBlur={true}
      onOpen={() => {
        setIsOpen(true);
      }}
      onClose={() => {
        setIsOpen(false);
      }}
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