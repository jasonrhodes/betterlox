import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { Select, SelectChangeEvent, Box, FormControl, InputLabel, MenuItem, Switch, FormControlLabel } from "@mui/material";
import { SortBy, SortDir } from "./helpers";

type StateChanger<T> = (value: T) => void;

export interface FilmEntryShowAndSortControlsOptions {
  show: number | "all";
  handleShowChange: StateChanger<SelectChangeEvent<number | "all">>;
  sortBy: SortBy;
  handleSortByChange: StateChanger<SelectChangeEvent<SortBy>>;
  sortDir: SortDir;
  handleSortDirClick: () => void;
  hideUnrated: boolean;
  handleHideUnratedClick: () => void;
}

export function FilmEntryShowAndSortControls({
  show,
  handleShowChange,
  sortBy,
  handleSortByChange,
  sortDir,
  handleSortDirClick,
  hideUnrated,
  handleHideUnratedClick
}: FilmEntryShowAndSortControlsOptions) {
  return (
    <Box sx={{ marginBottom: '20px' }}>
      {/* <Box sx={{ display: { xs: 'none', md: 'inline-block' }}}>
        <Chip 
          color="secondary" 
          label={`${processedRatings.length} of ${unprocessedRatings.length}`} 
          sx={{ marginRight: '10px' }} 
        />
      </Box> */}
      <FormControl sx={{ marginRight: "10px", minWidth: 80, verticalAlign: "middle" }} size="small">
        <InputLabel id="select-show-per-page-label">Show</InputLabel>
        <Select
          labelId="select-show-per-page"
          id="select-show-per-page"
          value={show}
          label="Show Per Page"
          autoWidth
          onChange={handleShowChange}
        >
          <MenuItem selected={show === 10} value={10}>{10}</MenuItem>
          <MenuItem selected={show === 50} value={50}>{50}</MenuItem>
          <MenuItem selected={show === 100} value={100}>{100}</MenuItem>
          <MenuItem selected={show === 250} value={250}>{250}</MenuItem>
          <MenuItem selected={show === 500} value={500}>{500}</MenuItem>
          <MenuItem selected={show === "all"} value={"all"}>{"all"}</MenuItem>
        </Select>
      </FormControl>
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
          <MenuItem selected={sortBy === "dateRated"} value="dateRated">Date Rated</MenuItem>
          <MenuItem selected={sortBy === "stars"} value="stars">Your Rating</MenuItem>
          <MenuItem selected={sortBy === "movie.title"} value="movie.title">Movie Title</MenuItem>
        </Select>
      </FormControl>
      <Box 
        sx={{ cursor: 'pointer', display: 'inline-flex', verticalAlign: "middle", marginRight: '10px' }} 
        onClick={handleSortDirClick}
      >
        <ArrowUpward color={sortDir === "DESC" ? "secondary" : "disabled"} />
        <ArrowDownward color={sortDir === "ASC" ? "secondary" : "disabled"} />
      </Box>
      {/* <FormControlLabel control={<Switch />} label="Hide unrated" /> */}
    </Box>
  )
}