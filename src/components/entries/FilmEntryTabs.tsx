import { TextField, Box, Tabs, Tab, FormControl, Typography } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import { BlindspotMovie, BlindspotsSortBy, EntryApiResponse, GlobalFilters } from "../../common/types/api";
import { escapeRegExp } from "../../lib/escapeRegex";
import { EntriesTable } from "../EntriesTable";
import { TabPanel, a11yTabProps } from "../TabPanel";
import { Blindspots, getBlindspotsForFilters } from "../UserBlindspots";
import { FilmEntrySortBy, applyTitleFilter, applySort } from "./helpers";
import { FilmEntryShowAndSortControls } from "./FilmEntryShowAndSortControls";
import { PartialMovie } from "../../common/types/base";
import { useCurrentUser } from "../../hooks/UserContext";
import { useSorting } from "../../hooks/useSorting";

interface FilmEntryTabsOptions {
  unprocessedEntries: EntryApiResponse[];
  filters: GlobalFilters;
  isReloading: boolean;
}

function removeInvalidEntries(entries: EntryApiResponse[], hideUnrated?: boolean) {
  if (hideUnrated) {
    entries = entries.filter((e) => Boolean(e.date) && typeof e.stars !== undefined);
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
  const [totalSeen, setTotalSeen] = useState<number>(0);
  const [quickTitleSearch, updateQuickTitleSearch] = useState<string>('');
  const [show, setShow] = useState<"all" | number>(100);
  const [processedEntries, updateProcessedEntries] = useState<EntryApiResponse[]>([]);
  const [blindspots, setBlindspots] = useState<BlindspotMovie[]>([]);
  const [blindspotsLoading, setBlindspotsLoading] = useState<boolean>(false);
  const sorting = useSorting<FilmEntrySortBy>("date");
  const blindspotSorting = useSorting<BlindspotsSortBy>("loxScore", "DESC");
  const { sortBy, sortDir } = sorting;
  const { user } = useCurrentUser();

  useEffect(() => {
    setIsProcessing(true);
    // TODO: Look into how to avoid re-validating the same data over and over
    const validated = removeInvalidEntries(unprocessedEntries);
    // TODO: Look into how to avoid re-filtering the same data with the same filter
    const filtered = applyTitleFilter(quickTitleSearch, validated);
    // TODO: Look into how to avoid re-sorting the same data over and over
    setTotalSeen(filtered.length);
    const filteredSorted = applySort(sortBy, sortDir, filtered);
    const filteredSortedSliced = show === "all" ? filteredSorted : filteredSorted.slice(0, show);

    updateProcessedEntries(filteredSortedSliced);
    setIsProcessing(false);
  }, [quickTitleSearch, unprocessedEntries, sortBy, sortDir, show])

  useEffect(() => {
    async function retrieve() {
      setBlindspotsLoading(true);
      const blindspots = await getBlindspotsForFilters({
        entries: processedEntries, 
        filters, 
        user,
        sorting: blindspotSorting
      });
      setBlindspots(blindspots);
      setBlindspotsLoading(false);
    }
    retrieve();
  }, [processedEntries, filters, user, blindspotSorting.sortBy, blindspotSorting.sortDir])

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

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="ratings tabs">
          <Tab label={`Seen (${totalSeen})`} {...a11yTabProps(0)} />
          <Tab label={`Blindspots (${blindspots.length})`} {...a11yTabProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0} sx={{ paddingLeft: 0 }}>
        <FilmEntryShowAndSortControls
          show={show}
          handleShowChange={handleShowChange}
          sorting={sorting}
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
        <Blindspots blindspots={blindspots} sorting={blindspotSorting} isLoading={blindspotsLoading} />
      </TabPanel>
    </Box>
  );
}