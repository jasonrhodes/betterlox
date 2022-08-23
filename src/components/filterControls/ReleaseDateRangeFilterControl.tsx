import { Autocomplete, FormControl, TextField } from "@mui/material";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { listBoxProps } from "./shared";

const years: string[] = [];
const now = new Date();
const nowYear = now.getFullYear();

for (let i = nowYear; i >= 1900; i--) {
  const y = i.toString();
  if (y.slice(3) === '0') {
    years.push(`Decade: ${y}s`);
  }
  years.push(y);
}

export function ReleaseDateRangeFilterControl() {
  const { globalFilters, setGlobalFilters } = useGlobalFilters();
  return (
    <FormControl>
      <Autocomplete
        sx={{
          width: 300,
          paper: {
            backgroundColor: "secondary.dark"
          }
        }}
        autoComplete
        id="stats-year-filter"
        value={globalFilters.releaseDateRange || null}
        options={years}
        renderInput={(params) => <TextField {...params} label="Release Date Range" />}
        ListboxProps={listBoxProps}
        onChange={(e, value) => setGlobalFilters({ ...globalFilters, releaseDateRange: value })}
      />
    </FormControl>
  )
}