import { Button, Grid, Typography } from "@mui/material";
import { CurrentFilters } from "./CurrentFilters";
import { useGlobalFilters } from "../../hooks/GlobalFiltersContext";
import { RatingsFilterFieldLookup } from "./FieldLookup";
import { Collection, Person } from "../../db/entities";
import { ReleaseDateRangeFilterControl } from "../filterControls/ReleaseDateRangeFilterControl";
import { GenreFilterControl } from "../filterControls/GenreFilterControl";
import { ExcludedGenreFilterControl } from "../filterControls/ExcludedGenreFilterControl";

export function RatingsFilterControls() {
  const { setGlobalFilters } = useGlobalFilters();
  return (
    <Grid item container spacing={2} sx={{ paddingBottom: 2 }}>
      <Grid item xs={12}>
        <Typography variant="body1"><b>Filters</b></Typography>
      </Grid>
      <Grid item xs={12}>
        <CurrentFilters />
      </Grid>
      <Grid item xs={12}>
        <ReleaseDateRangeFilterControl />
      </Grid>
      <Grid item xs={12}>
        <GenreFilterControl />
      </Grid>
      <Grid item xs={12}>
        <ExcludedGenreFilterControl />
      </Grid>
      <Grid item xs={12}>
        <RatingsFilterFieldLookup<Person>
          searchType="people"
          filterKey="actors"
          AutocompleteSx={{ width: 300 }}
          isOptionEqualToValue={(option, value) => value && option.id === value.id}
          getOptionLabel={(option) => option.name}
          getId={(options) => options.id}
        />
      </Grid>
      <Grid item xs={12}>
        <RatingsFilterFieldLookup<Person>
          searchType="people"
          filterKey="directors"
          AutocompleteSx={{ width: 300 }}
          isOptionEqualToValue={(option, value) => value && option.id === value.id}
          getOptionLabel={(option) => option.name}
          getId={(options) => options.id}
        />
      </Grid>
      <Grid item xs={12}>
        <RatingsFilterFieldLookup<Collection>
          searchType="collections"
          filterKey="collections"
          AutocompleteSx={{ width: 300 }}
          isOptionEqualToValue={(option, value) => value && option.id === value.id}
          getOptionLabel={(option) => option.name}
          getId={(options) => options.id}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" onClick={() => setGlobalFilters({})}>Clear Filters</Button>
      </Grid>
    </Grid>
  )
}