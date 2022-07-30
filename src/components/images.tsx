import React from "react";
import { SxProps } from "@mui/material";
import useImageConfigs from "../hooks/useImageConfigs";
import Image, { ImageProps } from "next/image";

const indexedSizes = ["smallest", "small", "medium", "large", "largest"];

export type ImageSize = "smallest" | "small" | "medium" | "large" | "largest";
export type ImageShape = "default" | "square" | "circle";
export type ImageType = "profile" | "backdrop" | "logo" | "poster" | "still";

export interface TMDBImageProps extends Omit<ImageProps, 'src'> {
  size?: ImageSize;
  shape?: ImageShape;
  type?: ImageType;
  tmdbPath: string;
  sx?: SxProps;
  urlOverride?: string;
}

export const TMDBImage: React.FC<TMDBImageProps> = ({
  tmdbPath, 
  type = "profile", 
  size = "medium", 
  shape = "default", 
  sx = {}, 
  urlOverride,
  ...rest
}) => {
  const config = useImageConfigs();
  let url = '';
  if (urlOverride) {
    url = urlOverride;
  } else {
    const sizes = config[`${type}_sizes`] || [];
    const index = (size === "smallest") ? 0 : (size === "largest") ? sizes.length - 1 : indexedSizes.indexOf(size);
    
    if (!config.secure_base_url) {
      console.log(config.errorStatus);
      throw new Error("No secure_base_url provided from TMDB oh noes " + config.errorStatus + '\n' + Object.keys(config).join(', '));
      return null;
    }
    url = `${config.secure_base_url}/${sizes[index]}${tmdbPath}`;
  }

  return (
    <Image alt="" {...rest} src={url} style={{ borderRadius: "3%" }} />
  );
}