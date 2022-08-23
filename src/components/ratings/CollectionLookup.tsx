import { Autocomplete, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CollectionsApiResponse, RatingsFilters, SearchApiResponse, SearchCollection } from '../../common/types/api';
import { Collection, Person } from '../../db/entities';
import { useRatingsFilters } from '../../hooks/GlobalFiltersContext';
import { useApi } from '../../hooks/useApi';

export function CollectionLookUp() {
  const [ratingsFilters, setRatingsFilters] = useRatingsFilters();
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [collectionOptions, setCollectionOptions] = useState<Pick<Collection, 'id' | 'name'>[]>([]);
  const response = useApi<SearchApiResponse<SearchCollection[]>>(`/api/search?searchType=collections&name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);

  useEffect(() => {
    const filtered = response?.data.results?.filter((c) => !ratingsFilters.collections?.includes(c.id));
    setCollectionOptions(filtered || []);
  }, [response, ratingsFilters]);

  return (
    <Autocomplete
      id="collection-search"
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
      onChange={(e, collection) => {
        const { collections = [] } = ratingsFilters;
        if (collection) {
          setRatingsFilters({ ...ratingsFilters, collections: [...collections, collection.id ]})
        }
        updateSearchValue('');
      }}
      onInputChange={(e, value) => {
        updateSearchValue(value);
      }}
      getOptionLabel={(option) => option.name}
      options={collectionOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter by collection"
        />
      )}
      filterOptions={(x) => x}
    />
  )
}