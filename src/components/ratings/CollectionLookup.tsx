import { Autocomplete, TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { CollectionsApiResponse, RatingsFilters } from '../../common/types/api';
import { Collection, Person } from '../../db/entities';
import { useApi } from '../../hooks/useApi';

export function CollectionLookUp({ filters, onChange }: { filters: RatingsFilters, onChange: (filters: RatingsFilters) => void }) {
  const [searchValue, updateSearchValue] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [collectionOptions, setCollectionOptions] = useState<Pick<Collection, 'id' | 'name'>[]>([]);
  const response = useApi<CollectionsApiResponse>(`/api/collections?name=${encodeURIComponent(searchValue)}&limit=100`, [searchValue]);

  useEffect(() => {
    const filtered = response?.data.collections.filter((c) => !filters.collections?.includes(c.id));
    setCollectionOptions(filtered || []);
  }, [response, filters]);

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
        const { collections = [] } = filters;
        if (collection) {
          onChange({ ...filters, collections: [...collections, collection.id ]})
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
          label="Search for a collection"
        />
      )}
      filterOptions={(x) => x}
    />
  )
}