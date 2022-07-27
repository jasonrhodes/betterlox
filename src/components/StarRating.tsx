import React from 'react';
import { Star, StarHalf } from '@mui/icons-material';
import { Box, PaletteColor } from '@mui/material';

export interface StarRatingOptions {
  rating: number;
  color?: "primary" | "secondary";
  style?: Record<string, any>;
}

const defaultStyles = {
  // color: "#D4AF37", // gold yellow
  fontSize: 24
};

export function StarRating({
  rating,
  color,
  style = {}
}: StarRatingOptions) {
  const stars = [];
  let i = 0;
  const computedStyle = {
    ...defaultStyles,
    ...style
  };

  const halfStyle = {
    ...computedStyle,
    fontSize: computedStyle.fontSize * 0.7
  };

  for (i; i < Math.floor(rating); i++) {
    stars.push(<Star color={color} key={`star-${i}`} sx={computedStyle} />);	
  }

  if (rating !== Math.floor(rating)) {
    stars.push(<Box color={color} key="star-half" sx={halfStyle}>½</Box>)
  }

  return <>{stars}</>;
}

