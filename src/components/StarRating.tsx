import React from 'react';
import { Star, StarHalf } from '@mui/icons-material';
import { Box } from '@mui/material';

export interface StarRatingOptions {
  rating: number;
  style?: Record<string, any>;
}

const defaultStyles = {
  color: "#D4AF37", // gold yellow
  fontSize: 24
};

export function StarRating({
  rating,
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
    stars.push(<Star sx={computedStyle} />);	
  }
  if (rating !== Math.floor(rating)) {
    stars.push(<Box sx={halfStyle}>½</Box>)
  }

  return <>{stars}</>;
}

