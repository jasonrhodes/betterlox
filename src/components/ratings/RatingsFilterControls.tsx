import { Button, Grid, Typography } from "@mui/material";
import { ActorLookUp } from "./ActorLookup";
import { CollectionLookUp } from "./CollectionLookup";
import { DirectorLookUp } from "./DirectorLookup";
import { CurrentFilters } from "./CurrentFilters";
import { useRatingsFilters } from "../../hooks/GlobalFiltersContext";

export function RatingsFilterControls() {
  const [, setRatingsFilters] = useRatingsFilters();
  return (
    <Grid item container spacing={2} sx={{ paddingBottom: 2 }}>
      <Grid item xs={12}>
        <Typography variant="body1"><b>Advanced Filters</b></Typography>
      </Grid>
      <Grid item xs={12}>
        <CurrentFilters />
      </Grid>
      <Grid item xs={12}>
        {/* <ReleaseDateLookUp /> */}
      </Grid>
      <Grid item xs={12}>
        <ActorLookUp />
      </Grid>
      <Grid item xs={12}>
        <DirectorLookUp />
      </Grid>
      <Grid item xs={12}>
        <CollectionLookUp />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" onClick={() => setRatingsFilters({})}>Clear Filters</Button>
      </Grid>
    </Grid>
  )
}