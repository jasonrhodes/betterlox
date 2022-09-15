import { SelectChangeEvent, Box } from "@mui/material";
import { SortControls, SortManagement } from "../../hooks/useSorting";
import { BasicSelect } from "../formControls/BasicSelect";
import { FilmEntrySortBy } from "./helpers";

export interface FilmEntryShowAndSortControlsOptions {
  show: number | "all";
  handleShowChange: (event: SelectChangeEvent<number | "all">) => void;
  sorting: SortManagement<FilmEntrySortBy>;
}

export function FilmEntryShowAndSortControls({
  show,
  handleShowChange,
  sorting
}: FilmEntryShowAndSortControlsOptions) {
  return (
    <Box sx={{ marginBottom: '20px' }}>
      <BasicSelect<number | "all"> 
        sx={{ marginRight: "10px", minWidth: 80, verticalAlign: "middle" }} size="small"
        value={show}
        handleValueChange={handleShowChange}
        options={[10, 50, 100, 250, 500, "all"]}
        id="select-show-per-page"
        labelId="select-show-per-page-label"
        label="Show"
      />
      <SortControls<FilmEntrySortBy> {...sorting} sortByOptions={{
        date: 'Date Rated',
        stars: 'Your Rating',
        ['movie.title']: 'Movie Title'
      }} />
    </Box>
  )
}