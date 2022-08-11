import { Button, Grid, Typography } from "@mui/material";
import { RatingsFilters } from "../../common/types/api";
import { ActorLookUp } from "./ActorLookup";
import { CollectionLookUp } from "./CollectionLookup";
import { DirectorLookUp } from "./DirectorLookup";
import { CurrentFilters } from "./CurrentFilters";

export function RatingsFilterControls({ filters, onChange }: { filters: RatingsFilters, onChange: (filters: RatingsFilters) => void }) {
  return (
    <Grid item container spacing={2} sx={{ paddingBottom: 5 }}>
      <Grid item xs={12}>
        <Typography variant="body1"><b>Advanced Filters</b></Typography>
      </Grid>
      <Grid item xs={12}>
        <CurrentFilters filters={filters} onChange={onChange} />
      </Grid>
      <Grid item xs={12}>
        <ActorLookUp filters={filters} onChange={onChange} />
      </Grid>
      <Grid item xs={12}>
        <DirectorLookUp filters={filters} onChange={onChange} />
      </Grid>
      <Grid item xs={12}>
        <CollectionLookUp filters={filters} onChange={onChange} />
      </Grid>
      <Grid item xs={12}>
        <Button variant="outlined" onClick={() => onChange({})}>Clear Filters</Button>
      </Grid>
    </Grid>
  )
}