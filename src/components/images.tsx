import React from "react";
import { Avatar } from "@mui/material";
import useImageConfigs from "../hooks/useImageConfigs";
import Image from "next/image";

const indexedSizes = ["smallest", "small", "medium", "large", "largest"];

export type ImageSize = "smallest" | "small" | "medium" | "large" | "largest";
export type ImageShape = "default" | "square" | "circle";
export type ImageType = "profile" | "backdrop" | "logo" | "poster" | "still";

export interface BasicImageProps {
  size?: ImageSize;
  shape?: ImageShape;
  type?: ImageType;
  path: string;
  sx?: Record<string, any>;
  alt?: string;
}

export const BasicImage: React.FC<BasicImageProps> = ({ path, type = "profile", size = "medium", shape = "default", sx = {}, alt = "no alt provided" }) => {
  const config = useImageConfigs();
  const sizes = config[`${type}_sizes`] || [];
  const index = (size === "smallest") ? 0 : (size === "largest") ? sizes.length - 1 : indexedSizes.indexOf(size);
  
  if (!config.secure_base_url) {
    throw new Error("YOU ARE BEGOTTEN TO THE GODS OF HELL: " + config.errorStatus + '\n' + Object.keys(config).join(', '));
  }
  const url = `${config.secure_base_url}/${sizes[index]}${path}`;

  if (shape === "circle") {
    sx.boxShadow = sx.boxShadow || "0 0 1px rgba(0,0,0,0.8)";
    return (
      <Avatar src={url} sx={sx} />
    );
  }

  return (
    <Image src={url} alt={alt} height={100} width={67} />
  );
}