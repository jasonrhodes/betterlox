import React from 'react';
import { Box, Chip, Slider, Typography } from '@mui/material';

interface CastControlsProps {
  castOrderThreshold: number;
  setCastOrderThreshold: (threshold: number) => void;
}

const CreditControls: React.FC<CastControlsProps> = ({ castOrderThreshold, setCastOrderThreshold }) => {
  return (
    <Box>
      <Typography>Cast Order Threshold: <Chip label={castOrderThreshold} /></Typography>
      <Slider
        defaultValue={castOrderThreshold}
        step={1}
        min={0}
        max={50}
        onChange={(e, value) => typeof value === "number" ? setCastOrderThreshold(value) : null}
      />
    </Box>
  );
};

export default CreditControls;