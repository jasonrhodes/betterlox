import { CardMedia } from "@mui/material";
import { useState, useEffect } from "react";
import { useTmdbImageBaseUrl } from "../images";

export function PersonImage({ path }: { path: string }) {
  const tmdbBasePath = useTmdbImageBaseUrl({ size: "large" });
  const [localPath, setLocalPath] = useState<string>('');

  useEffect(() => {
    const localPath = `${tmdbBasePath}${path}`;
    setLocalPath(localPath);
  }, [path, tmdbBasePath]);

  return (
    <CardMedia
      component="img"
      image={localPath}
      sx={{ width: 75, marginRight: 2, boxShadow: "2px 2px 2px rgba(0,0,0,0.3)", borderRadius: "2px" }}
      onError={() => setLocalPath('/img/no-poster.png')}
    />
  );
}