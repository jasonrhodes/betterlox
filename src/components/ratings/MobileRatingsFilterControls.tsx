import { Close, Tune } from '@mui/icons-material';
import { Box, Button, Dialog, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { RatingsFilters } from '../../common/types/api';
import { RatingsFilterControls } from './RatingsFilterControls';

export function MobileRatingsFilterControls({
  currentFilters,
  onChange
}: {
  currentFilters: RatingsFilters;
  onChange: (filters: RatingsFilters) => void;
}) {
  const [updatedFilters, setUpdatedFilters] = useState<RatingsFilters>(currentFilters);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const handleUpdate = () => {
    onChange(updatedFilters);
    setIsOpen(false);
  }
  const handleCancel = () => {
    setIsOpen(false);
  }

  useEffect(() => setUpdatedFilters(currentFilters), [currentFilters]);

  return (
    <>
      <Box sx={{ cursor: 'pointer', display: { xs: 'inline-flex', md: 'none' }, verticalAlign: 'middle', marginRight: '10px' }}>
        <Tune onClick={() => setIsOpen(true) } />
      </Box>
      <Dialog
        fullScreen
        open={isOpen}
        PaperProps={{ sx: { backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
      >
        <Close 
          onClick={() => setIsOpen(false)} 
          sx={{ cursor: "pointer", position: "absolute", top: 18, right: 25 }} 
        />
        <Grid container spacing={4}>
          <RatingsFilterControls filters={updatedFilters} onChange={setUpdatedFilters} />
          {
            (currentFilters !== updatedFilters) ?
              <Grid item><Button onClick={() => handleUpdate()}>Apply Filters</Button></Grid> :
              null
          }
          <Grid item><Button onClick={() => handleCancel()}>Cancel</Button></Grid>
        </Grid>
      </Dialog>
    </>
  )
}