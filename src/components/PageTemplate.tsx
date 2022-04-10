import React, { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import { Avatar, Box, Breakpoint, Button, CircularProgress, Container, Typography } from '@mui/material';
import { MainNav } from "./MainNav";
import Link from 'next/link';
import { BasicImage } from './images';
import { UserContext, UserContextConsumer } from '../hooks/UserContext';
import { useRouter } from 'next/router';

export interface BackLinkProps {
  url: string;
  text?: string;
}

export interface PageTemplateProps {
  title: string;
  isPublic?: boolean;
  backLink?: BackLinkProps;
  avatarUrl?: string;
  maxWidth?: false | Breakpoint;
}

const BackLink: React.FC<BackLinkProps> = ({ url, text = 'Go Back' }) => {
  return (
    <Link href={url}>
      <Button>← {text}</Button>
    </Link>
  );
}

const Loading: React.FC = () => (
  <Box><CircularProgress /></Box>
);

export const PageTemplate: React.FC<PageTemplateProps> = ({ title, backLink, children, avatarUrl, isPublic, maxWidth = 'lg' }) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [ready, setReady] = useState(false);

  console.log({ ready, title, isPublic, user });

  useEffect(() => {
    if (!isPublic && !user) {
      router.push('/');
    } else {
      setReady(true);
    }
  }, [isPublic, user]);

  const headingStyles = avatarUrl ? {
    float: 'left',
    width: 500,
    lineHeight: '150px'
  } : {};
  
  return !ready ? null : (
    <>
      <MainNav />
      <Container maxWidth={maxWidth}>
        <Head>
          <title>{title}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Box
          sx={{
            my: 4,
            padding: '10px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box>
            {backLink && backLink.url ? <BackLink {...backLink} /> : null}
            <Box>
              {avatarUrl ? <BasicImage path={avatarUrl} shape='circle' sx={{ float: 'left', width: 150, height: 150, marginRight: '20px', border: '1px solid rgba(0,0,0,0.3)', boxShadow: '0 3px 4px rgba(0,0,0,0.3)' }} /> : null}
              <Typography sx={headingStyles} component='h1' variant='h4' gutterBottom={true}><strong>{title}</strong></Typography>
            </Box>
          </Box>
          {children}
        </Box>
      </Container>
    </>
  );
}