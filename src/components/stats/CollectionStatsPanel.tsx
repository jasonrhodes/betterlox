import { Box, Typography, Grid, Card, CardHeader, CardMedia } from "@mui/material";
import { StatMode } from "../../common/types/api";
import { Collection } from "../../db/entities";
import { useTmdbImageBaseUrl } from "../images";
import { getTitleByMode } from "./helpers";

export function CollectionsStatsPanel({ collections, mode }: { collections: Collection[]; mode: StatMode; }) {
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