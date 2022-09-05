import { Autocomplete, Box, SxProps, TextField, Typography } from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { GlobalFilters, SearchApiResponse, SearchCollection } from '../../common/types/api';
import { Person } from '../../db/entities';
import { useGlobalFilters } from '../../hooks/GlobalFiltersContext';
import { callApi, useApi } from '../../hooks/useApi';
import { TMDBImage } from '../images';

type ChangeHandler<T> = (e: React.SyntheticEvent, option: T | null) => void;
type GetIdFunction<T> = (options: T) => string | number;

interface AutocompleteFilterProps<T> {
  options: T[];
  inputValue: string;
  onChange: ChangeHandler<T>;
  onInputChange: ChangeHandler<string>;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getOptionLabel: (option: T) => string;
  getId: GetIdFunction<T>;
  loading: boolean;
  loadingCount: number;
}

let retrievalCount = 0;

function useAutocompleteFilterOptions<T extends Person | SearchCollection>({
  searchType,
  limit,
  filterKey,
  getId = (option) => ('id' in option ? option.id : option),
  getOptionLabel = (option) => option.toString()
}: {
  searchType: string;
  limit?: number;
  filterKey: keyof GlobalFilters;
  getId?: GetIdFunction<T>;
  getOptionLabel?: (option: T) => string;
}): AutocompleteFilterProps<T> {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();
  const [inputValue, setInputValue] = useState<string>('');
  const [options, setOptions] = useState<T[]>([]);
  const [isLoadingCount, setIsLoadingCount] = useState<number>(0);
  
  useEffect(() => {
    async function retrieve() {
      console.log(retrievalCount++, isLoadingCount);
      setIsLoadingCount((count) => count + 1);
      try {
        const encodedInputValue = encodeURIComponent(inputValue);
        const apiEndpoint = `/api/search?searchType=${searchType}&limit=${limit}&role=${String(filterKey)}&name=${encodedInputValue}`;
        const response = await callApi<SearchApiResponse<T[]>>(apiEndpoint);
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
      } catch (error) {
        setIsLoadingCount((count) => Math.max(0, count - 1));
        throw error;
      }
      setIsLoadingCount((count) => Math.max(0, count - 1));
    }

    // DEBOUNCE retrieval of new data to avoid oversearching on type
    const handle = setTimeout(retrieve, 200);

    return () => {
      clearTimeout(handle);
    }
  }, [inputValue, searchType, limit, globalFilters, filterKey]);

  return {
    options,
    inputValue,
    loading: isLoadingCount > 0,
    loadingCount: isLoadingCount,
    getId,
    getOptionLabel,
    onChange: (e, incoming) => {
      const existing = globalFilters[filterKey] || [];
      // console.log('change', existing, incoming);
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
  getOptionLabel,
  getId
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
  getId?: GetIdFunction<T>;
}) {
  const acProps = useAutocompleteFilterOptions<T>({
    searchType,
    limit,
    filterKey,
    getId,
    getOptionLabel
  });
  
  return (
    <FieldLookup 
      acProps={acProps}
      id={id}
      inputLabel={inputLabel}
      sx={AutocompleteSx}
    />
  );
}

function isPerson(value: any): value is Person {
  return (
    'name' in value && 
    typeof value.name === "string" &&
    'profilePath' in value &&
    (typeof value.profilePath === "string" || typeof value.profilePath === "undefined")
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
    <Autocomplete<T>
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
      renderOption={(props, option) => {
        const id = acProps.getId(option);
        const label = acProps.getOptionLabel(option);
        const profilePath = isPerson(option) ? option.profilePath : "";
        return (
          <li {...props} key={id}>
            <Box sx={{ display: 'flex' }}>
              {profilePath.length ? <Box sx={{ marginRight: 2 }}>
                <TMDBImage tmdbPath={profilePath} width={30} height={45} />
              </Box> : null}
              <Box>
                <Typography>{label}</Typography>
              </Box>
            </Box>
          </li>
        );
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