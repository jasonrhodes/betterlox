import { ExpandMore } from "@mui/icons-material";
import { SxProps, Box, Tabs, Tab, Button, Accordion, AccordionDetails, AccordionSummary, Typography, Stack } from "@mui/material";
import { useCallback, useState } from "react";
import { ExcludedGenreFilterControl } from "./filterControls/ExcludedGenreFilterControl";
import { OnlyWomenFilterControl, OnlyNonBinaryFilterControl } from "./filterControls/genderFilterControls";
import { GenreFilterControl } from "./filterControls/GenreFilterControl";
import { ReleaseDateRangeFilterControl } from "./filterControls/ReleaseDateRangeFilterControl";
import { a11yTabProps, TabPanel } from "./TabPanel";

export interface Tab {
  label: string;
  content: JSX.Element;
}

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

interface TabNavPageOptions {
  tabs: Tab[];
  value?: number;
  setValue?: (v: number) => void;
}

export function TabNavPage({
  tabs,
  value,
  setValue
}: TabNavPageOptions) {
  const [internalValue, setInternalValue] = useState<number>(0);

  const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue ? setValue(newValue) : setInternalValue;
  }, [setValue, setInternalValue]);
  
  return (
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
        value={setValue ? value : internalValue}
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
        {tabs.map((tab, i) => (
          <Tab key={tab.label} sx={tabSx} label={tab.label} {...a11yTabProps(i)} />
        ))}
      </Tabs>
      <Box sx={{ flex: 1 }}>
        <MobileTabSwitcher tabs={tabs} value={typeof value === "number" ? value : internalValue} setValue={setValue ? setValue : setInternalValue}  />
        {tabs.map((tab, i) => (
          <TabPanel key={tab.label} sx={tabPanelSx} value={typeof value === "number" ? value : internalValue} index={i}>
            {tab.content}
          </TabPanel>
        ))}
      </Box>
    </Box>
  )
}

interface MobileTabSwitcherOptions { 
  value: number; 
  setValue: (value: number) => void; 
  tabs: Tab[];
}

export function MobileTabSwitcher({ value, setValue, tabs }: MobileTabSwitcherOptions) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  function handleTabClick(i: number) {
    setIsOpen(false);
    setValue(i);
  }

  return (
    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0, mb: 5 }}>
      <Accordion 
        expanded={isOpen} 
        onChange={() => setIsOpen(!isOpen)} 
        square={true} 
        color="primary" 
        variant="elevation" 
        elevation={1}
        sx={{ mb: 1, width: '100%' }}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex">
            <Box sx={{ mr: 1 }}><Typography component="span">Viewing: </Typography><Typography component="span" color="primary"><b>{tabs[value].label}</b></Typography></Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={1}>
          {tabs.map(({ label }, i) => value !== i ? (
            <Box key={label}>
              <Button variant="text" onClick={() => handleTabClick(i)}>{label}</Button>
            </Box>
          ) : null)}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}