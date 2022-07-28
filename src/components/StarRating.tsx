import React from 'react';
import { StarRounded, StarHalfRounded } from '@mui/icons-material';
import { sizeHeight } from '@mui/system';

export interface StarRatingOptions {
  score: number;
  color?: "primary" | "secondary";
  style?: Record<string, any>;
  size?: number;
}

export function StarRating({
  score,
  color,
  size = 20,
  style = {}
}: StarRatingOptions) {
  const stars = [];
  let i = 0;
  const computedStyle = {
    fontSize: size,
    ...style
  };

  const halfStyle = {
    ...computedStyle,
    fontSize: computedStyle.fontSize * 0.7
  };

  for (i; i < Math.floor(score); i++) {
    stars.push(<StarRounded color={color} key={`star-${i}`} sx={computedStyle} />);	
  }

  if (score !== Math.floor(score)) {
    stars.push(<StarHalfRounded color={color} key="star-half" sx={computedStyle} />);
  }

  return <>{stars}</>;
}

