import React, { useEffect, useState } from "react";
import { Avatar, AvatarProps, Box, SxProps } from "@mui/material";
import useImageConfigs from "../hooks/useImageConfigs";
import Image, { ImageProps } from "next/legacy/image";

const indexedSizes = ["smallest", "small", "medium", "large", "largest"];

export type ImageSize = "smallest" | "small" | "medium" | "large" | "largest";
export type ImageShape = "default" | "square" | "circle";
export type ImageType = "profile" | "backdrop" | "logo" | "poster" | "still";

export interface TMDBImageProps extends Omit<ImageProps, 'src'> {
  size?: ImageSize;
  shape?: ImageShape;
  type?: ImageType;
  tmdbPath?: string;
  sx?: SxProps;
  imageStyles?: React.CSSProperties;
  urlOverride?: string;
}

export function useTmdbImageBaseUrl({ size = "medium", type = "profile" }: { size?: ImageSize, type?: ImageType } = {}) {
  const config = useImageConfigs();
  const sizes = config[`${type}_sizes`] || [];
  const index = (size === "smallest") ? 0 : (size === "largest") ? sizes.length - 1 : indexedSizes.indexOf(size);

  if (!config.secure_base_url) {
    console.log(config.errorStatus);
    throw new Error("No secure_base_url provided from TMDB oh noes " + config.errorStatus + '\n' + Object.keys(config).join(', '));
  }
  return `${config.secure_base_url}/${sizes[index]}`;
}

export function PosterImage({ path, width = 400, sx = {}, alt }: { path?: string; width?: number; sx?: SxProps, alt: string; }) {
  return <TMDBImage alt={alt} tmdbPath={path} width={width} height={width * 1.5} sx={sx} />
}

export function BackdropImage({ path, width = 1200, sx = {}, alt }: { path?: string; width?: number; sx?: SxProps; alt: string; }) {
  return <TMDBImage alt={alt} tmdbPath={path} width={width} height={width / 1.77} sx={sx} />
}


export const TMDBImage: React.FC<TMDBImageProps> = ({
  tmdbPath, 
  type = "profile", 
  size = "medium", 
  shape = "default", 
  sx = {}, 
  imageStyles = {},
  urlOverride,
  alt,
  ...rest
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const baseUrl = useTmdbImageBaseUrl({ size, type });

  useEffect(() => {
    const url = urlOverride ? urlOverride : `${baseUrl}${tmdbPath}`;
    setSrc(url);
  }, [urlOverride, tmdbPath, baseUrl])
  
  if (src === null) {
    return null;
  }

  return (
    <Box sx={sx}>
      <Image
        {...rest} 
        alt={alt}
        onError={() => setSrc("/img/no-poster.png")}
        src={src} 
        style={{ 
          borderRadius: "3%",
          ...imageStyles
        }}
      />
    </Box>
  );
}

interface TmdbAvatarOptions extends AvatarProps {
  tmdbPath: string;
}

export function TmdbAvatar({ tmdbPath, ...rest }: TmdbAvatarOptions) {
  const baseUrl = useTmdbImageBaseUrl({ type: 'profile', size: 'largest' });

  return (
    <Avatar src={`${baseUrl}/${tmdbPath}`} {...rest} />
  );
}