import { TextField, Box, Tabs, Tab, FormControl, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import { GlobalFilters } from "../../common/types/api";
import { FilmEntry } from "../../db/entities";
import { escapeRegExp } from "../../lib/escapeRegex";
import { EntriesTable } from "../EntriesTable";
import { TabPanel, a11yTabProps } from "../TabPanel";
import { MissingMovie, getMissingMoviesForFilters, MissingMovieList } from "../UserMissingMovies";
import { SortBy, SortDir, applyTitleFilter, applySort } from "./helpers";
import { FilmEntryShowAndSortControls } from "./FilmEntryShowAndSortControls";

interface FilmEntryTabsOptions {
  unprocessedEntries: FilmEntry[];
  filters: GlobalFilters;
}

export function FilmEntryTabs({
  unprocessedEntries, 
  filters
}: FilmEntryTabsOptions) {
  const [value, setValue] = React.useState<number>(0);
  const [activeFilterCount, setActiveFilterCount] = React.useState<number>(0);
  const [missing, setMissing] = useState<MissingMovie[]>([]);
  const [quickTitleSearch, updateQuickTitleSearch] = useState<string>('');
  const [show, setShow] = React.useState<"all" | number>(100);
  const [sortBy, setSortBy] = React.useState<SortBy>("dateRated");
  const [sortDir, setSortDir] = React.useState<SortDir>("DESC");
  const [processedEntries, updateProcessedEntries] = useState<FilmEntry[]>([]);

  useEffect(() => {
    // TODO: Look into how to avoid re-filtering the same data with the same filter
    const filtered = applyTitleFilter(quickTitleSearch, unprocessedEntries);
    // TODO: Look into how to avoid re-sorting the same data over and over
    const filteredSorted = applySort(sortBy, sortDir, filtered);
    const filteredSortedSliced = show === "all" ? filteredSorted : filteredSorted.slice(0, show);

    updateProcessedEntries(filteredSortedSliced);
  }, [quickTitleSearch, unprocessedEntries, sortBy, sortDir, show])

  const handleQuickTitleSearchChange = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>>((event) => {
    updateQuickTitleSearch(escapeRegExp(event.target.value));
  }, []);

  const handleShowChange = React.useCallback((event) => {
    const { value } = event.target;
    if (value === "all") {
      setShow("all");
    } else {
      setShow(Number(value));
    }
  }, []);

  const handleSortByChange = React.useCallback((event) => {
    const { value } = event.target;
    setSortBy(value);
  }, []);

  const handleSortDirClick = React.useCallback(() => {
    setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
  }, [sortDir]);

  useEffect(() => {
    async function retrieve() {
      const missing = await getMissingMoviesForFilters({ entries: unprocessedEntries, filters });
      setMissing(missing);
    }
    const filterKeys = Object.keys(filters) as Array<keyof GlobalFilters>;
    const activeFilterCount = filterKeys.reduce((count, key) => {
      const f = filters[key];
      const numActive = Array.isArray(f) ? f.length : (f !== undefined && f !== null) ? 1 : 0;
      return count + numActive;
    }, 0);
    setActiveFilterCount(activeFilterCount);
    if (activeFilterCount === 0) {
      setMissing([]);
    } else {
      retrieve();
    }
  }, [unprocessedEntries, filters]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="ratings tabs">
          <Tab label="Seen" {...a11yTabProps(0)} />
          <Tab label="Blindspots" {...a11yTabProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <FilmEntryShowAndSortControls
          show={show}
          handleShowChange={handleShowChange}
          sortBy={sortBy}
          handleSortByChange={handleSortByChange}
          sortDir={sortDir}
          handleSortDirClick={handleSortDirClick}
        />
        <FormControl sx={{ marginBottom: 2 }}>
          <TextField size="small" label="Quick Title Filter" value={quickTitleSearch} onChange={handleQuickTitleSearchChange} />
        </FormControl>
        <EntriesTable entries={processedEntries} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {activeFilterCount === 0 ? <Typography>No blindspots for these filters.</Typography> : <MissingMovieList movies={missing} />}
      </TabPanel>
    </Box>
  );
}