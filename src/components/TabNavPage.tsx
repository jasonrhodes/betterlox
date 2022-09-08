import { SxProps, Box, Tabs, Tab } from "@mui/material";
import { useCallback, useState } from "react";
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

interface MobileContentProps {
  value: number;
  setValue: (v: number) => void;
  sx: SxProps;
}

export function TabNavPage({
  tabs,
  MobileContent
}: {
  tabs: Tab[];
  MobileContent?: (props: MobileContentProps) => JSX.Element;
}) {
  const [value, setValue] = useState<number>(0);

  const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  }, []);
  
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
        {tabs.map((tab, i) => (
          <Tab key={tab.label} sx={tabSx} label={tab.label} {...a11yTabProps(i)} />
        ))}
      </Tabs>
      <Box sx={{ flex: 1 }}>
        {MobileContent ? <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
          <MobileContent value={value} setValue={setValue} sx={{ display: { xs: 'block', md: 'none' }}} />
        </Box> : null}
        {tabs.map((tab, i) => (
          <TabPanel key={tab.label} sx={tabPanelSx} value={value} index={i}>
            {tab.content}
          </TabPanel>
        ))}
      </Box>
    </Box>
  )
}