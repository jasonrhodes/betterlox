import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useCallback, useState } from "react";

export type SortDir = 'ASC' | 'DESC';

export interface SortManagement<T extends string> {
  sortBy: T,
  setSortBy: (value: T) => void;
  sortDir: SortDir;
  setSortDir: (value: SortDir) => void;
}

export function useSorting<T extends string>(initialSortBy: T, initialSortDir: SortDir = 'DESC'): SortManagement<T> {
  const [sortBy, setSortBy] = useState<T>(initialSortBy);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);

  return {
    sortBy,
    setSortBy,
    sortDir,
    setSortDir
  }
}

export function SortControls<T extends string>({ 
  sortBy, 
  sortDir, 
  setSortBy, 
  setSortDir,
  sortByOptions
}: SortManagement<T> & { sortByOptions: Record<T, string>}) {
  const optionKeys = Object.keys(sortByOptions) as T[]; 

  const handleSortByChange = useCallback((event) => {
    const { value } = event.target;
    setSortBy(value);
  }, [setSortBy]);

  const handleSortDirClick = useCallback(() => {
    setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
  }, [sortDir, setSortDir]);

  return (
    <>
      <FormControl sx={{ marginRight: "10px", minWidth: 80, verticalAlign: "middle" }} size="small">
        <InputLabel id="select-sort-by-label">Sort By</InputLabel>
        <Select
          labelId="select-sort-by"
          id="select-sort-by"
          value={sortBy}
          label="Sort By"
          autoWidth
          onChange={handleSortByChange}
        >
          {optionKeys.map(option => (
            <MenuItem key={option} selected={sortBy === option} value={option}>{sortByOptions[option]}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box 
        sx={{ cursor: 'pointer', display: 'inline-flex', verticalAlign: "middle", marginRight: '10px' }} 
        onClick={handleSortDirClick}
      >
        <ArrowUpward color={sortDir === "DESC" ? "secondary" : "disabled"} />
        <ArrowDownward color={sortDir === "ASC" ? "secondary" : "disabled"} />
      </Box>
    </>
  );
}