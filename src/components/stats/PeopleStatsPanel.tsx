import { Box, Typography, capitalize, Accordion, AccordionSummary, AccordionDetails, FormControl, Checkbox, FormControlLabel, Autocomplete, TextField, Switch, Chip } from "@mui/material";
import { HtmlHTMLAttributes, useState } from "react";
import { PersonStats, PeopleStatsType, StatMode, GlobalFilters } from "../../common/types/api";
import { getTitleByMode } from "./helpers";
import { StatsSettings } from "./StatsSettings";
import { PersonDetails } from "./PersonDetails";
import { CardsPersonStats, ListPersonStats } from "./statsDisplay";
import { AddBox, CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { ReleaseDateRangeFilterControl } from "../filterControls/ReleaseDateRangeFilterControl";
import { GenreFilterControl } from "../filterControls/GenreFilterControl";
import { ExcludedGenreFilterControl } from "../filterControls/ExcludedGenreFilterControl";
import { OnlyNonBinaryFilterControl, OnlyWomenFilterControl } from "../filterControls/genderFilterControls";

interface PeopleStatsPanelOptions {
  people: PersonStats[]; 
  type: PeopleStatsType; 
  mode: StatMode;
}

function StatsFilterChip({ label }: { label: string }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color="secondary"
      label={label}
      sx={{ mr: 1, mb: 1 }}
    />
  )
}

function StatsFiltersSummary() {
  const { globalFilters } = useGlobalFilters();
  const { releaseDateRange, genres = [], excludedGenres = [], onlyWomen, onlyNonBinary } = globalFilters;

  let genderFilter = "";

  if (onlyWomen && !onlyNonBinary) {
    genderFilter = "Only Women";
  }

  if (!onlyWomen && onlyNonBinary) {
    genderFilter = "Only Non-Binary";
  }

  if (onlyWomen && onlyNonBinary) {
    genderFilter = "Only Women and Non-Binary";
  }

  return (
    <Box sx={{ mb: 2 }}>
      {releaseDateRange ? <StatsFilterChip label={`Released In: ${releaseDateRange.replace(/^Decade: /, '')}`} /> : null}
      {genres.length > 0 ? <StatsFilterChip label={`Genres: ${genres.join(' + ')}`} /> : null}
      {excludedGenres.length > 0 ? <StatsFilterChip label={`Excluded Genres: ${excludedGenres.join(', ')}`} /> : null}
      {genderFilter ? <StatsFilterChip label={genderFilter} /> : null}
    </Box>
  );
}

function PeopleStatFilters() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <>
      <Accordion 
        expanded={isOpen} 
        onChange={() => setIsOpen(!isOpen)} 
        square={true} 
        color="primary" 
        variant="elevation" 
        elevation={1}
        sx={{ mb: 2 }}
        disableGutters
      >
        <AccordionSummary expandIcon={<AddBox />}>
          <Box display="flex">
            <Box sx={{ mr: 1 }}><Typography>QUICK FILTERS</Typography></Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Box sx={{ mb: 2 }}>
              <ReleaseDateRangeFilterControl />
            </Box>
            <Box sx={{ mb: 2 }}>
              <GenreFilterControl />
            </Box>
            <Box sx={{ mb: 2 }}>
              <ExcludedGenreFilterControl />
            </Box>
            {/* Not implementing ANY functionality for genres at this time, will hard-code to true
            <Box>
              <FormControlLabel 
                control={<Switch />} 
                label="Only consider movies that include ALL of the above genres"
                value={statsFilters.allGenres}
                onChange={(e, value) => setStatsFilters({ ...statsFilters, allGenres: value })}
              />
            </Box> */}
            <Box>
              <OnlyWomenFilterControl />
            </Box>
            <Box>
              <OnlyNonBinaryFilterControl />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      {!isOpen ? <StatsFiltersSummary /> : null}
    </>
  )
}

export function PeopleStatsPanel({ people, type, mode }: PeopleStatsPanelOptions) {
  const [details, setDetails] = useState<PersonStats | null>(null);
  const PRESENTATION_SPLIT = 24;
  const PRESENTATION_MAX = 50;
  const topStats = people.slice(0, PRESENTATION_SPLIT);
  const bottomStats = people.slice(PRESENTATION_SPLIT, PRESENTATION_MAX);
  const showMinCastOrder = type === "actors";
  const showMinWatched = mode === "favorite";

  return (
    <Box sx={{ backgroundColor: "rose" }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ marginBottom: 3 }}>
          {getTitleByMode(mode, capitalize(type))}
        </Typography>
        <StatsSettings showMinCastOrder={showMinCastOrder} showMinWatched={showMinWatched} />
      </Box>
      <PeopleStatFilters />
      {people.length === 0 ?
        <Box>
          <Typography>No results match this set of criteria.</Typography>
        </Box> :
        <>
          <CardsPersonStats people={topStats} setDetails={setDetails} />
          <ListPersonStats people={bottomStats} setDetails={setDetails} splitNumber={PRESENTATION_SPLIT} />
        </>
      }
      <PersonDetails type={type} details={details} setDetails={setDetails} />
    </Box>
  )
}