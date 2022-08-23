import { Box, Typography, capitalize, Accordion, AccordionSummary, AccordionDetails, FormControl, Checkbox, FormControlLabel, Autocomplete, TextField, Switch, Chip } from "@mui/material";
import { HtmlHTMLAttributes, useState } from "react";
import { PersonStats, PeopleStatsType, StatMode, StatsFilters } from "../../common/types/api";
import { getTitleByMode } from "./helpers";
import { StatsSettings } from "./StatsSettings";
import { PersonDetails } from "./PersonDetails";
import { CardsPersonStats, ListPersonStats } from "./statsDisplay";
import { AddBox, CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { Genre } from "../../db/entities";
import { GENRES } from "../../common/constants";
import { useStatsFilters } from "../../hooks/GlobalFiltersContext";

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

interface PeopleStatsPanelOptions {
  people: PersonStats[]; 
  type: PeopleStatsType; 
  mode: StatMode;
  statsFilters: StatsFilters;
  setStatsFilters: (f: StatsFilters) => void;
}

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const lbProps: React.HTMLAttributes<HTMLUListElement> = {
  style: {
    border: '1px solid rgba(255,255,255,0.2)',
    borderTop: 'none',
    borderRadius: '4px',
    boxShadow: '0 3px 6px 8px rgba(0,0,0,0.5)'
  }
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
  const [statsFilters] = useStatsFilters();

  const { years, genres = [], excludedGenres = [], onlyWomen, onlyNonBinary } = statsFilters;

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
      {years ? <StatsFilterChip label={`Released In: ${years.replace(/^Decade: /, '')}`} /> : null}
      {genres.length > 0 ? <StatsFilterChip label={`Genres: ${genres.join(' + ')}`} /> : null}
      {excludedGenres.length > 0 ? <StatsFilterChip label={`Excluded Genres: ${excludedGenres.join(', ')}`} /> : null}
      {genderFilter ? <StatsFilterChip label={genderFilter} /> : null}
    </Box>
  );
}

function PeopleStatFilters({ type, setStatsFilters, statsFilters }: { type: PeopleStatsType; setStatsFilters: (f: StatsFilters) => void; statsFilters: StatsFilters; }) {
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
                  value={statsFilters.years || null}
                  options={years}
                  renderInput={(params) => <TextField {...params} label="Release Date Range" />}
                  ListboxProps={lbProps}
                  onChange={(e, value) => setStatsFilters({ ...statsFilters, years: value })}
                />
              </FormControl>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete<string, true>
                multiple
                autoComplete
                id="stats-genre-filter"
                disableCloseOnSelect
                options={GENRES}
                sx={{ width: 500, maxWidth: '100%' }}
                value={statsFilters.genres}
                renderInput={(params) => <TextField {...params} label="Genres" />}
                ListboxProps={lbProps}
                renderOption={(props, genre, { selected }) => !statsFilters.excludedGenres?.includes(genre) ? (
                  <Box key={genre}>
                    <li {...props}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {genre}
                    </li>
                  </Box>
                ) : null}
                onChange={(e, values) => setStatsFilters({ ...statsFilters, genres: values })}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Autocomplete<string, true>
                multiple
                autoComplete
                id="stats-excluded-genre-filter"
                disableCloseOnSelect
                options={GENRES}
                sx={{ width: 500, maxWidth: '100%' }}
                value={statsFilters.excludedGenres}
                renderInput={(params) => <TextField {...params} label="Excluded Genres" />}
                ListboxProps={lbProps}
                renderOption={(props, genre, { selected }) => !statsFilters.genres?.includes(genre) ? (
                  <Box key={genre}>
                    <li {...props}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {genre}
                    </li>
                  </Box>
                ): null}
                onChange={(e, values) => setStatsFilters({ ...statsFilters, excludedGenres: values })}
              />
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
              <FormControlLabel 
                control={<Switch />} 
                label="Only consider women"
                checked={statsFilters.onlyWomen}
                value={statsFilters.onlyWomen}
                onChange={(e, value) => setStatsFilters({ ...statsFilters, onlyWomen: value })}
              />
            </Box>
            <Box>
              <FormControlLabel 
                control={<Switch />} 
                label="Only consider non-binary"
                checked={statsFilters.onlyNonBinary}
                value={statsFilters.onlyNonBinary}
                onChange={(e, value) => setStatsFilters({ ...statsFilters, onlyNonBinary: value })}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
      {!isOpen ? <StatsFiltersSummary /> : null}
    </>
  )
}

export function PeopleStatsPanel({ people, type, mode, setStatsFilters, statsFilters }: PeopleStatsPanelOptions) {
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
      <PeopleStatFilters type={type} statsFilters={statsFilters} setStatsFilters={setStatsFilters} />
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