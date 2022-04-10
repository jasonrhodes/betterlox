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

export const PageTemplate: React.FC<PageTemplateProps> = ({ title, backLink, children, isPublic, maxWidth = 'lg' }) => {
  const router = useRouter();
  const { user, validating } = useContext(UserContext);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (validating) {
      return;
    }
    if (!isPublic && !user) {
      const target = window.location.href.split('/').slice(3).join('/');
      if (target) {
        router.push(`/login?redirect=/${target}`);
      } else {
        router.push('/login');
      }
    } else {
      setReady(true);
    }
  }, [isPublic, user, validating]);
  
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
              <Typography component='h1' variant='h4' gutterBottom={true}><strong>{title}</strong></Typography>
            </Box>
          </Box>
          {children}
        </Box>
      </Container>
    </>
  );
}