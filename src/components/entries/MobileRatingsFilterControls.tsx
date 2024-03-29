import { Close, Tune } from '@mui/icons-material';
import { Box, Button, Dialog, Grid } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { GlobalFilters } from "../../common/types/api";
import { GlobalFiltersContextProvider, GlobalFiltersContextConsumer } from '../../hooks/GlobalFiltersContext';
import { RatingsFilterControls } from './RatingsFilterControls';

type GlobalFiltersUpdater = (f: GlobalFilters) => void;

export function MobileRatingsFilterControls({ 
  appliedFilters, 
  applyFilters 
}: { 
  appliedFilters: GlobalFilters; 
  applyFilters: GlobalFiltersUpdater; 
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // This method takes the updated filters passed to it from the
  // nested GlobalFiltersContextProvider and sets them using the
  // props-passed setRatingsFilters function (called "applyFilters")
  const handleApplyClick = (updatedFilters: GlobalFilters) => {
    applyFilters(updatedFilters);
    setIsOpen(false);
  }

  // This method takes the setRatingsFilters from the nested
  // GlobalFiltersContextProvider and calls it with the outer filters
  // to reset the inner ones back to the outer ones
  const handleCancel = (resetUpdatedFilters: GlobalFiltersUpdater) => {
    resetUpdatedFilters(appliedFilters);
    setIsOpen(false);
  }

  // This component uses a nested GlobalFiltersContextProvider so that the mobile
  // updates don't trigger data refreshes until the user selects "Apply Changes"
  return (
    <GlobalFiltersContextProvider initialGlobalFilters={appliedFilters}>
      <Box sx={{ cursor: 'pointer', display: { xs: 'inline-flex', md: 'none' }, verticalAlign: 'middle', marginRight: '10px' }}>
        <Tune onClick={() => setIsOpen(true) } />
      </Box>
      <GlobalFiltersContextConsumer>
        {({ globalFilters: updatedFilters, setGlobalFilters: setUpdatedFilters }) => (
          <Dialog
            fullScreen
            open={isOpen}
            PaperProps={{ sx: { backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
          >
            <Close
              onClick={() => handleCancel(setUpdatedFilters)} 
              sx={{ cursor: "pointer", position: "absolute", top: 18, right: 25 }} 
            />
            <Grid container spacing={4}>
              <RatingsFilterControls />
              <Grid item>
                <Button 
                  disabled={updatedFilters === appliedFilters}
                  onClick={() => handleApplyClick(updatedFilters)}
                >Apply Changes</Button>
              </Grid>
              <Grid item>
                <Button onClick={() => handleCancel(setUpdatedFilters)}>Cancel</Button>
              </Grid>
            </Grid>
          </Dialog>
        )}
      </GlobalFiltersContextConsumer>
    </GlobalFiltersContextProvider>
  )
}