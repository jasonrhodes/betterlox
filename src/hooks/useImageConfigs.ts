import React from "react";
import { ImageContext } from "./ImageConfigContext";

export default function useImageConfigs() {
  return React.useContext(ImageContext);
}