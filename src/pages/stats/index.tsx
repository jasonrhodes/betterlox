import React, { useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Box, SxProps, Tab, Tabs } from '@mui/material';
import { a11yTabProps, TabPanel } from '../../components/TabPanel';
import { StatMode, StatsFilters } from '../../common/types/api';
import { StatModeToggle } from '../../components/stats/StatModeToggle';
import { StatsTab } from '../../components/stats/StatsTab';
import { MobileSwitcher } from '../../components/stats/MobileSwitcher';

const StatsPage: NextPage = () => {
  const [value, setValue] = useState<number>(0);
  const [mode, setMode] = useState<StatMode>('favorite');
  const [statsFilters, setStatsFilters] = useState<StatsFilters>({});

  function toggleStatMode() {
    setMode(mode === 'favorite' ? 'most' : 'favorite');
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabSx: SxProps = {
    textAlign: "left",
    alignSelf: "start",
    p: '12px 32px 12px 0'
  };

  const tabPanelSx: SxProps = {
    paddingLeft: {
      xs: 0,
      md: 4
    },
    py: 0,
    paddingRight: 0,
    flexGrow: 1
  };

  return (
    <UserPageTemplate 
      title="My Stats" 
      titleLineRightContent={<StatModeToggle mode={mode} toggleMode={toggleStatMode} />}
    >
      {() => (
        <Box
          sx={{ 
            bgcolor: 'transparent', 
            display: {
              xs: 'block',
              md: 'flex'
            }
          }}
        >
          <Tabs
            orientation="vertical"
            variant="standard"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ 
              borderRight: 1, 
              borderColor: 'divider', 
              alignItems: "flex-start",
              flexShrink: 0,
              paddingLeft: 0,
              display: {
                xs: 'none',
                md: 'inherit'
              }
            }}
          >
            <Tab sx={tabSx} label="Actors" {...a11yTabProps(0)} />
            <Tab sx={tabSx} label="Directors" {...a11yTabProps(1)} />
            <Tab sx={tabSx} label="Cinematographers" {...a11yTabProps(2)} />
            <Tab sx={tabSx} label="Editors" {...a11yTabProps(3)} />
            {/* <Tab sx={tabSx} label="Collections" {...a11yTabProps(4)} /> */}
          </Tabs>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
              <MobileSwitcher value={value} setValue={setValue} sx={{ display: { xs: 'block', md: 'none' }}} />
            </Box>
            <TabPanel sx={tabPanelSx} value={value} index={0}>
              <StatsTab type="actors" mode={mode} />
            </TabPanel>
            <TabPanel sx={tabPanelSx} value={value} index={1}>
              <StatsTab type="directors" mode={mode} />
            </TabPanel>
            <TabPanel sx={tabPanelSx} value={value} index={2}>
              <StatsTab type="cinematographers" mode={mode} />
            </TabPanel>
            <TabPanel sx={tabPanelSx} value={value} index={3}>
              <StatsTab type="editors" mode={mode} />
            </TabPanel>
            <TabPanel sx={tabPanelSx} value={value} index={4}>
              <StatsTab type="collections" mode={mode} />
            </TabPanel>
          </Box>
        </Box>
      )}
    </UserPageTemplate>
  );
}
  
export default StatsPage;