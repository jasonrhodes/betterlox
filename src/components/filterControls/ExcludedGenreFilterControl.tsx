import { Autocomplete, Box, Checkbox, TextField } from "@mui/material";
import { GENRES } from "@rhodesjason/loxdb/dist/common/constants";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { checkboxIcon, checkboxIconChecked, listBoxProps } from "./shared";

export function ExcludedGenreFilterControl() {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();

  return (
    <Autocomplete<string, true>
      multiple
      autoComplete
      id="stats-excluded-genre-filter"
      disableCloseOnSelect
      options={GENRES}
      sx={{ width: 500, maxWidth: '100%' }}
      value={globalFilters.excludedGenres}
      renderInput={(params) => <TextField {...params} label="Excluded Genres" />}
      ListboxProps={listBoxProps}
      renderOption={(props, genre, { selected }) => !globalFilters.genres?.includes(genre) ? (
        <Box key={genre}>
          <li {...props}>
            <Checkbox
              icon={checkboxIcon}
              checkedIcon={checkboxIconChecked}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {genre}
          </li>
        </Box>
      ): null}
      onChange={(e, values) => setGlobalFilters({ ...globalFilters, excludedGenres: values })}
    />
  );
}