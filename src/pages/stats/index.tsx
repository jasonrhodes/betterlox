import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { PageTemplate, UserPageTemplate } from '../../components/PageTemplate';
import { Badge, Box, Button, Card, CardContent, CardHeader, CardMedia, Dialog, Drawer, Grid, SxProps, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { a11yTabProps, TabPanel } from '../../components/TabPanel';
import Link from 'next/link';
import { Collection, Person, Rating } from '../../db/entities';
import { callApi } from '../../hooks/useApi';
import { AllStatsType, PeopleStatsType, PersonStats, StatMode, UserStatsResponse } from '../../common/types/api';
import Image from 'next/image';
import { TMDBImage, useTmdbImageBaseUrl } from '../../components/images';
import { Close, Settings, Star, Visibility } from '@mui/icons-material';
import { RatingsTable } from '../../components/RatingsTable';
import { convertFiltersToQueryString } from '../../components/ratings/helpers';
import { capitalize } from '../../lib/capitalize';


function StatModeToggle({ mode, toggleMode }: { mode: StatMode; toggleMode: () => void; }) {
  return (
    <ToggleButtonGroup
      color="secondary"
      value={mode}
      exclusive
      onChange={toggleMode}
      size="small"
    >
      <ToggleButton value="favorite">Highest Rated</ToggleButton>
      <ToggleButton value="most">Most Watched</ToggleButton>
    </ToggleButtonGroup>
  )
}

const StatsPage: NextPage = () => {
  const [value, setValue] = useState<number>(0);
  const [mode, setMode] = useState<StatMode>('favorite');

  function toggleStatMode() {
    setMode(mode === 'favorite' ? 'most' : 'favorite');
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabSx: SxProps = {
    textAlign: "left",
    alignSelf: "start"
  };

  const tabPanelSx: SxProps = {
    px: {
      xs: 0,
      md: 4
    },
    py: 0
  };

  return (
    <UserPageTemplate 
      title="My Stats" 
      titleLineRightContent={<StatModeToggle mode={mode} toggleMode={toggleStatMode} />}
    >
      {({ user }) => (
        <Box
          sx={{ flexGrow: 1, bgcolor: 'transparent', display: {
            xs: 'block',
            md: 'flex'
          } }}
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
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
            <MobileSwitcher value={value} setValue={setValue} sx={{ display: { xs: 'block', md: 'none' }}} />
          </Box>
          <TabPanel sx={tabPanelSx} value={value} index={0}>
            <StatsTab userId={user.id} type="actors" mode={mode} />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={1}>
            <StatsTab userId={user.id} type="directors" mode={mode} />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={2}>
            <StatsTab userId={user.id} type="cinematographers" mode={mode} />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={3}>
            <StatsTab userId={user.id} type="editors" mode={mode} />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={4}>
            <StatsTab userId={user.id} type="collections" mode={mode} />
          </TabPanel>
        </Box>
      )}
    </UserPageTemplate>
  );
}

function isPeople(list: PersonStats[] | Collection[]): list is PersonStats[] {
  return list && list[0] && 'placeOfBirth' in list[0];
}

function isCollections(list: PersonStats[] | Collection[]): list is Collection[] {
  return list && list[0] && 'posterPath' in list[0];
}

function StatsTab({ type, userId, mode }: { type: AllStatsType; userId: number; mode: StatMode; }) {
  const [results, setResults] = useState<(PersonStats[] | Collection[])>([]);
  useEffect(() => {
    async function retrieve() {
      const { data } = await callApi<UserStatsResponse>(`/api/users/${userId}/stats?type=${type}&mode=${mode}`);
      setResults(data.stats);
    }
    retrieve();
  }, [type, userId]);
  
  if (isPeople(results)) {
    return <PeopleStatsPanel userId={userId} people={results} type={type as PeopleStatsType} mode={mode} />
  }

  if (isCollections(results)) {
    return <CollectionsStatsPanel collections={results} mode={mode} />
  }

  return null;
}

function round(x: number, places: number = 1) {
  const multiplier = Math.pow(10, places);
  return Math.round(x * multiplier) / multiplier;
}

function PersonImage({ path }: { path: string }) {
  const tmdbBasePath = useTmdbImageBaseUrl({ size: "large" });
  const [localPath, setLocalPath] = useState<string>('');

  useEffect(() => {
    const localPath = `${tmdbBasePath}${path}`;
    setLocalPath(localPath);
  }, [path, tmdbBasePath]);

  return (
    <CardMedia
      component="img"
      image={localPath}
      sx={{ width: 75, marginRight: 2, boxShadow: "2px 2px 2px rgba(0,0,0,0.3)", borderRadius: "2px" }}
      onError={() => setLocalPath('/img/no-poster.png')}
    />
  );
}

function getTitleByMode(mode: StatMode, value: string) {
  const prefix = mode === "most" ? "Most Watched" : "Highest Rated";
  return `${prefix} ${value}`;
}

function PeopleStatsPanel({ people, type, userId, mode }: { people: PersonStats[]; type: PeopleStatsType; userId: number; mode: StatMode; }) {
  const [details, setDetails] = useState<PersonStats | null>(null);
  const PRESENTATION_SPLIT = 24;
  const PRESENTATION_MAX = 50;
  const topStats = people.slice(0, PRESENTATION_SPLIT);
  const bottomStats = people.slice(PRESENTATION_SPLIT, PRESENTATION_MAX);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ marginBottom: 4 }}>
          {getTitleByMode(mode, capitalize(type))}
        </Typography>
        <PeopleStatSettings />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {topStats.map((person, i) => (
          <Box 
            key={person.id} 
            sx={{ 
              width: 250, 
              display: 'flex', 
              marginRight: 1, 
              marginBottom: 4, 
              padding: 2,
              cursor: "pointer",
              opacity: 0.9,
              transition: 'all 0.3s ease-out',
              '&:hover': {
                opacity: 1,
                backgroundColor: 'rgba(0,0,0,0.2)'
              }
            }}
            onClick={() => setDetails(person)}
          >
            <Badge color="secondary" badgeContent={i + 1} anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}>
              <PersonImage path={person.profilePath} />
            </Badge>
            <Box>
              <Typography color="primary" component="h3" variant="body1" sx={{ marginBottom: 1 }}>{person.name}</Typography>
              <Typography component="div" variant="caption" sx={{ verticalAlign: 'middle', opacity: 0.6 }}>
                <Star fontSize="small" />
                {' '}
                <span style={{ position: 'relative', top: -5, left: 2 }}>{round(person.averageRating)}</span>
              </Typography>
              <Typography component="div" variant="caption" sx={{ opacity: 0.6 }}>
                <Visibility fontSize="small" />
                {' '}
                <span style={{ position: 'relative', top: -5, left: 2 }}>{person.countRated}</span>
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      <Box>
        {bottomStats.map((person, i) => (
          <Box 
            key={person.id} 
            sx={{ 
              marginBottom: 1, 
              paddingLeft: 5,
              py: 1,
              position: "relative",
              cursor: "pointer",
              transition: 'all 0.3s ease-out',
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.2)"
              }
            }}
            onClick={() => setDetails(person)}
          >
            <Typography component="span">{person.name}</Typography>
            {' '}
            <Typography component="span" sx={{ opacity: 0.4 }}>({round(person.averageRating)} | {person.countRated})</Typography>
            <Box sx={{ 
              position: 'absolute', 
              top: 8, 
              left: 8,
              backgroundColor: "secondary.main",
              color: "#000",
              borderRadius: "20px",
              padding: "2px 4px",
              fontSize: "12px"
            }}>
              {i + (PRESENTATION_SPLIT + 1)}
            </Box>
          </Box>
        ))}
      </Box>
      <PersonDetails userId={userId} type={type} details={details} setDetails={setDetails} />
    </Box>
  )
}

function PeopleStatSettings() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return null;
  // return (
  //   <Settings fontSize="large" sx={{ cursor: "pointer" }} />
  // )
}

function PersonDetails({ userId, type, details, setDetails }: { userId: number, type: PeopleStatsType; details: null | PersonStats; setDetails: (d: null | PersonStats) => void }) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  useEffect(() => {
    if (details === null) {
      return;
    }
    async function retrieve(id: number) {
      const qs = convertFiltersToQueryString({ [type]: [id] });
      const url = `/api/users/${userId}/ratings?${qs}`;
      const response = await callApi<{ ratings: Rating[] }>(url);
      setRatings(response.data.ratings);
    }
    retrieve(details.id);
  }, [details, type, userId]);

  if (details === null) {
    return null;
  } 
  return (
    // <Dialog
    //   fullScreen
    //   open={!(details === null)}
    //   PaperProps={{ sx: { backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
    // >
    <Drawer
      anchor="right"
      open={!(details === null)}
      onClose={() => setDetails(null)}
      PaperProps={{ sx: { width: 540, maxWidth: "100%", backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
    >
      <Typography sx={{ my: 2 }}>{capitalize(type)}{' > '}<b>{details.name}</b></Typography>
      <Close sx={{ cursor: "pointer", position: "absolute", top: 20, right: 20 }} onClick={() => setDetails(null) } />
      <RatingsTable
        ratings={ratings}
      />
    </Drawer>
    // </Dialog>
  )
}

function CollectionsStatsPanel({ collections, mode }: { collections: Collection[]; mode: StatMode; }) {
  const tmdbBasePath = useTmdbImageBaseUrl({ size: "large" });
  return (
    <Box>
      <Typography variant="h5">{getTitleByMode(mode, "Collections")}</Typography>
      <Grid container>
        {collections.map((collection) => (
          <Grid item key={collection.id}>
            <Card>
              <CardHeader>{collection.name}</CardHeader>
              <CardMedia
                component="img"
                height="200"
                image={`${tmdbBasePath}${collection.posterPath}`}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

function MobileSwitcher({ sx, value, setValue }: { sx: SxProps; value: number; setValue: (value: number) => void; }) {
  return (
    <Box sx={sx}>
      <ul>
        <li>
          <Button variant={value === 0 ? "outlined" : "text"} onClick={() => setValue(0)}>Actors</Button>
        </li>
        <li>
          <Button variant={value === 1 ? "outlined" : "text"} onClick={() => setValue(1)}>Directors</Button>
        </li>
        <li>
          <Button variant={value === 2 ? "outlined" : "text"} onClick={() => setValue(2)}>Cinematographers</Button>
        </li>
        <li>
          <Button variant={value === 3 ? "outlined" : "text"} onClick={() => setValue(3)}>Editors</Button>
        </li>
        <li>
          <Button variant={value === 4 ? "outlined" : "text"} onClick={() => setValue(4)}>Collections</Button>
        </li>
      </ul>
    </Box>
  )
}
  
export default StatsPage;