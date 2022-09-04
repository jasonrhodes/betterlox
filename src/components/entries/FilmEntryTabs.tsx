import { TextField, Box, Tabs, Tab, FormControl, Typography } from "@mui/material";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { EntryApiResponse, GlobalFilters } from "../../common/types/api";
import { FilmEntry, Movie } from "../../db/entities";
import { escapeRegExp } from "../../lib/escapeRegex";
import { EntriesTable } from "../EntriesTable";
import { TabPanel, a11yTabProps } from "../TabPanel";
import { Blindspots } from "../UserBlindspots";
import { SortBy, SortDir, applyTitleFilter, applySort } from "./helpers";
import { FilmEntryShowAndSortControls } from "./FilmEntryShowAndSortControls";

interface FilmEntryTabsOptions {
  unprocessedEntries: EntryApiResponse[];
  filters: GlobalFilters;
  isReloading: boolean;
}

function removeInvalidEntries(entries: EntryApiResponse[], hideUnrated: boolean) {
  // switch (sortBy) {
  //   case 'dateRated':
  //     entries = entries.filter((e) => Boolean(e.dateRated));
  //     break;
  //   case 'stars':
  //     entries = entries.filter((e) => Boolean(e.stars));
  //     break;
  //   case 'movie.title':
  //     entries = entries.filter((e) => Boolean(e.movie?.title));
  //     break;
  // }

  if (hideUnrated) {
    entries = entries.filter((e) => Boolean(e.dateRated) && typeof e.stars !== undefined);
  }

  entries = entries.filter((e) => Boolean(e.movie));
  return entries;
}

export function FilmEntryTabs({
  unprocessedEntries, 
  filters,
  isReloading
}: FilmEntryTabsOptions) {
  const [value, setValue] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);
  const [quickTitleSearch, updateQuickTitleSearch] = useState<string>('');
  const [show, setShow] = useState<"all" | number>(100);
  const [sortBy, setSortBy] = useState<SortBy>("dateRated");
  const [sortDir, setSortDir] = useState<SortDir>("DESC");
  const [hideUnrated, setHideUnrated] = useState<boolean>(false);
  const [processedEntries, updateProcessedEntries] = useState<EntryApiResponse[]>([]);

  useEffect(() => {
    setIsProcessing(true);
    // TODO: Look into how to avoid re-validating the same data over and over
    const validated = removeInvalidEntries(unprocessedEntries, hideUnrated);
    // TODO: Look into how to avoid re-filtering the same data with the same filter
    const filtered = applyTitleFilter(quickTitleSearch, validated);
    // TODO: Look into how to avoid re-sorting the same data over and over
    const filteredSorted = applySort(sortBy, sortDir, filtered);
    const filteredSortedSliced = show === "all" ? filteredSorted : filteredSorted.slice(0, show);

    updateProcessedEntries(filteredSortedSliced);
    setIsProcessing(false);
  }, [quickTitleSearch, unprocessedEntries, sortBy, sortDir, show, hideUnrated])

  const handleQuickTitleSearchChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>>((event) => {
    updateQuickTitleSearch(escapeRegExp(event.target.value));
  }, []);

  const handleShowChange = useCallback((event) => {
    const { value } = event.target;
    if (value === "all") {
      setShow("all");
    } else {
      setShow(Number(value));
    }
  }, []);

  const handleSortByChange = useCallback((event) => {
    const { value } = event.target;
    setSortBy(value);
  }, []);

  const handleSortDirClick = useCallback(() => {
    setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
  }, [sortDir]);

  const toggleHideUnrated = useCallback(() => {
    setHideUnrated(!hideUnrated);
  }, [hideUnrated]);

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
      <TabPanel value={value} index={0} sx={{ paddingLeft: 0 }}>
        <FilmEntryShowAndSortControls
          show={show}
          handleShowChange={handleShowChange}
          sortBy={sortBy}
          handleSortByChange={handleSortByChange}
          sortDir={sortDir}
          handleSortDirClick={handleSortDirClick}
          hideUnrated={hideUnrated}
          handleHideUnratedClick={toggleHideUnrated}
        />
        <FormControl sx={{ marginBottom: 2 }}>
          <TextField 
            size="small" 
            label="Quick Title Filter" 
            value={quickTitleSearch} 
            onChange={handleQuickTitleSearchChange} 
          />
        </FormControl>
        <EntriesTable entries={processedEntries} isLoading={isReloading || isProcessing} />
      </TabPanel>
      <TabPanel value={value} index={1} sx={{ paddingLeft: 0 }}>
        <Blindspots entries={unprocessedEntries} />
      </TabPanel>
    </Box>
  );
}