import { Box, Typography, Grid, Card, CardHeader, CardMedia } from "@mui/material";
import type { Collection } from "@rhodesjason/loxdb/dist/db/entities";
import { useTmdbImageBaseUrl } from "../images";
import { getTitleByMode } from "./helpers";
import { StatMode } from "@rhodesjason/loxdb/dist/common/types/db";

export function CollectionsStatsPanel({ collections, mode, isLoading }: { collections: Collection[]; mode: StatMode; isLoading: boolean; }) {
  const tmdbBasePath = useTmdbImageBaseUrl({ size: "large" });
  return (
    <Box>
      <Typography variant="h5">{getTitleByMode(mode, "Collections")}</Typography>
      <Grid container>
        {collections.map((collection) => (
          <Grid item key={collection.id}>
            <Card>
              <CardHeader>{collection.name}</CardHeader>
              <CardMedia
                component="img"
                height="200"
                image={`${tmdbBasePath}${collection.posterPath}`}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}