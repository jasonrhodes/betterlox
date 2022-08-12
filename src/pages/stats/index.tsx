import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { PageTemplate, UserPageTemplate } from '../../components/PageTemplate';
import { Badge, Box, Button, Card, CardContent, CardHeader, CardMedia, Dialog, Grid, SxProps, Tab, Tabs, Typography } from '@mui/material';
import { a11yTabProps, TabPanel } from '../../components/TabPanel';
import Link from 'next/link';
import { Collection, Person, Rating } from '../../db/entities';
import { callApi } from '../../hooks/useApi';
import { AllStatsType, PeopleStatsType, PersonStats, UserStatsResponse } from '../../common/types/api';
import Image from 'next/image';
import { TMDBImage, useTmdbImageBaseUrl } from '../../components/images';
import { Close, Settings, Star, Visibility } from '@mui/icons-material';
import { RatingsTable } from '../../components/RatingsTable';
import { convertFiltersToQueryString } from '../../components/ratings/helpers';
import { capitalize } from '../../lib/capitalize';

const StatsPage: NextPage = () => {
  const [value, setValue] = React.useState(0);

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
    <UserPageTemplate title="My Stats">
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
            <Tab sx={tabSx} label="Collections" {...a11yTabProps(4)} />
          </Tabs>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, flexShrink: 0 }}>
            <MobileSwitcher value={value} setValue={setValue} sx={{ display: { xs: 'block', md: 'none' }}} />
          </Box>
          <TabPanel sx={tabPanelSx} value={value} index={0}>
            <StatsTab userId={user.id} type="actors" />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={1}>
            <StatsTab userId={user.id} type="directors" />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={2}>
            <StatsTab userId={user.id} type="cinematographers" />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={3}>
            <StatsTab userId={user.id} type="editors" />
          </TabPanel>
          <TabPanel sx={tabPanelSx} value={value} index={4}>
            <StatsTab userId={user.id} type="collections" />
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

function StatsTab({ type, userId }: { type: AllStatsType; userId: number; }) {
  const [results, setResults] = useState<(PersonStats[] | Collection[])>([]);
  useEffect(() => {
    async function retrieve() {
      const { data } = await callApi<UserStatsResponse>(`/api/users/${userId}/stats?type=${type}`);
      setResults(data.stats);
    }
    retrieve();
  }, [type, userId]);
  
  if (isPeople(results)) {
    return <PeopleStatsPanel userId={userId} people={results} type={type as PeopleStatsType} />
  }

  if (isCollections(results)) {
    return <CollectionsStatsPanel collections={results} />
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

function PeopleStatsPanel({ people, type, userId }: { people: PersonStats[]; type: PeopleStatsType; userId: number; }) {
  
  const [details, setDetails] = useState<PersonStats | null>(null);
  const top20 = people.slice(0, 20);
  const next30 = people.slice(20, 50);
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ marginBottom: 4 }}>
          My Favorite {capitalize(type)}
        </Typography>
        <PeopleStatSettings />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {top20.map((person, i) => (
          <Box 
            key={person.id} 
            sx={{ 
              width: 250, 
              display: 'flex', 
              marginRight: 2, 
              marginBottom: 6, 
              cursor: "pointer"
            }}
            onClick={() => setDetails(person)}
          >
            <Badge color="secondary" badgeContent={i + 1} anchorOrigin={{
              vertical: 'bottom',
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
        {next30.map((person, i) => (
          <Box key={person.id} sx={{ 
            marginBottom: 1, 
            paddingLeft: 4, 
            position: "relative"
          }}>
            <Typography component="span">{person.name}</Typography>
            {' '}
            <Typography component="span" sx={{ opacity: 0.4 }}>({round(person.averageRating)} | {person.countRated})</Typography>
            <Box sx={{ 
              position: 'absolute', 
              top: 1, 
              left: 0,
              backgroundColor: "secondary.main",
              color: "#000",
              borderRadius: "20px",
              padding: "2px 4px",
              fontSize: "12px"
            }}>
              {i + 21}
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
    <Dialog
      fullScreen
      open={!(details === null)}
      PaperProps={{ sx: { backgroundColor: 'background.default', backgroundImage: 'none', px: 5, py: 3 }}}
    >
      <Typography sx={{ marginBottom: 3 }}>Details: {details.name} ({capitalize(type)})</Typography>
      <Close sx={{ cursor: "pointer", position: "absolute", top: 20, right: 20 }} onClick={() => setDetails(null) } />
      <RatingsTable
        ratings={ratings}
      />
    </Dialog>
  )
}

function CollectionsStatsPanel({ collections }: { collections: Collection[]; }) {
  const tmdbBasePath = useTmdbImageBaseUrl({ size: "large" });
  return (
    <Box>
      <Typography variant="h5">My Favorite Collections</Typography>
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