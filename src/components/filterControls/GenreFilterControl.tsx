import { Autocomplete, Box, Checkbox, TextField } from "@mui/material";
import { GENRES } from "../../common/constants";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { checkboxIcon, checkboxIconChecked, listBoxProps } from "./shared";

export function GenreFilterControl() {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();

  return (
    <Autocomplete<string, true>
      multiple
      autoComplete
      id="stats-genre-filter"
      disableCloseOnSelect
      options={GENRES}
      sx={{ width: 500, maxWidth: '100%' }}
      value={globalFilters.genres}
      renderInput={(params) => <TextField {...params} label="Genres" />}
      ListboxProps={listBoxProps}
      renderOption={(props, genre, { selected }) => !globalFilters.excludedGenres?.includes(genre) ? (
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
      ) : null}
      onChange={(e, values) => setGlobalFilters({ ...globalFilters, genres: values })}
    />
  );
}