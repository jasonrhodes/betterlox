import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { useRouter } from 'next/router';
import { Box, Button, Grid, Link, Typography } from '@mui/material';
import Image from 'next/image';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const HomePage: NextPage = () => {
  const router = useRouter();
  return (
    <Box sx={{ backgroundColor: "#001021" }}>
      <PageTemplate title="" maxWidth='lg'>
        <Typography component="div" sx={{ textAlign: 'center', fontSize: { xs: 36, s: 48, md: 64, lg: 80 }, lineHeight: 1, mt: 6, mb: 15 }}>Welcome to Betterlox.</Typography>
        
        <IntroCard
          alignImage="left"
          image={{
            src: '/img/letterboxd-is-great.png',
            width: 2078,
            height: 1636
          }}
          text={<>First of all, Letterboxd is an <em>incredible</em> site. We love it with all our hearts.</>}
          subtext={<>If you don&apos;t have a Letterboxd account, <Link href="https://letterboxd.com/?register=true" target="_blank" rel="noreferrer">go get one right now</Link>!</>}
        />
        <IntroCard
          alignImage="right"
          image={{
            src: '/img/betterlox-code.png',
            width: 2940,
            height: 1840
          }}
          text={<>Second, we wanted to build a few new features for ourselves and our friends ... </>}
        />

        <IntroCard
          alignImage="left"
          image={{
            src: '/img/filters-for-ratings.png',
            width: 2544,
            height: 1530
          }}
          text={<>...like advanced filters for your watches and ratings...</>}
        />

        <IntroCard
          alignImage="right"
          image={{
            src: '/img/blindspots.png',
            width: 2544,
            height: 1656
          }}
          text={<>...a quick way to see all your blindspots for a set of filters...</>}
        />

        <IntroCard
          alignImage="left"
          image={{
            src: '/img/stats-1.png',
            width: 2482,
            height: 1598
          }}
          text={<>...exciting new ways to explore your favorite or most watched actors...</>}
        />

        <IntroCard
          alignImage="right"
          image={{
            src: '/img/stats-2.png',
            width: 2524,
            height: 1662
          }}
          text={<>...or your favorite directors, cinematographers, and more...</>}
        />

        <IntroCard
          alignImage="left"
          image={{
            src: '/img/lists.png',
            width: 2490,
            height: 1674
          }}
          text={<>...and of course, more ways to track your progress on lists, lists, and MORE LISTS!</>}
        />

        <Button sx={{ py: 8, mb: 5, fontSize: 36 }} size="large" color="primary" variant="contained" onClick={() => router.push("/register")}>Sign up now!</Button>
        <Typography component="p" sx={{ mb: 30 }}>Want to support Betterlox? <Link href="https://letterboxd.com/pro/" target="_blank" rel="noreferrer">Sign up for Letterboxd Pro or Patron levels.</Link> There&apos;s no Betterlox without Letterboxd!</Typography>
      </PageTemplate>
    </Box>
  );
}

interface IntroCardOptions {
  alignImage: 'left' | 'right';
  image: {
    src: string;
    width: number;
    height: number;
  }
  text: JSX.Element;
  subtext?: JSX.Element;
}

function IntroCard({ alignImage, image, text, subtext }: IntroCardOptions) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    alignImage = "left";
  }

  const imageSection = (
    <Grid item xs={12} md={7}>
      <Box sx={{ ['& > span']: { 
        border: '1px solid rgba(255,255,255,0.1) !important', 
        boxShadow: '0 3px 3px rgba(0,0,0,0.2) !important' 
      }}}>
        <Image {...image} layout="responsive" />
      </Box>
    </Grid>
  );

  const textSection = (
    <Grid item xs={12} md={5}>
      <Typography component="p" sx={{ fontSize: { xs: 24, md: 36 }, lineHeight: 1.3 }}>
        {text}
      </Typography>
      {subtext ? <Typography variant="caption">{subtext}</Typography>  : null}
    </Grid>
  );

  return (
    <Grid container spacing={8} sx={{ mb: isMobile ? 20 : 15, display: "flex", alignItems: "center" }}>
      {alignImage === "left" ? imageSection : textSection}
      {alignImage === "left" ? textSection : imageSection}
    </Grid>
  );
}

export default HomePage;