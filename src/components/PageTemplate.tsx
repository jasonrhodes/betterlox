import React, { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import { Box, Breakpoint, Button, CircularProgress, Container, LinearProgress, Typography } from '@mui/material';
import { MainNav } from "./MainNav";
import Link from 'next/link';
import { UserContext, UserContextValue, ValidUserContextValue } from '../hooks/UserContext';
import { useRouter } from 'next/router';
import { UserPublic } from '../common/types/db';

export interface BackLinkProps {
  url: string;
  text?: string;
}

type ChildrenFunction = (props: ValidUserContextValue) => JSX.Element;
export interface PublicPageTemplateProps {
  title: string;
  headTitle?: string;
  backLink?: BackLinkProps;
  avatarUrl?: string;
  maxWidth?: false | Breakpoint;
  children: React.ReactNode;
}
export interface UserPageTemplateProps extends PublicPageTemplateProps {
  children: ChildrenFunction;
}

const BackLink: React.FC<BackLinkProps> = ({ url, text = 'Go Back' }) => {
  return (
    <Link href={url} passHref>
      <Button>← {text}</Button>
    </Link>
  );
}

const Loading: React.FC = () => (
  <Box><CircularProgress /></Box>
);

export const UserPageTemplate: React.FC<UserPageTemplateProps> = ({ children: Children, ...rest }) => {
  const router = useRouter();
  const userContext = useContext(UserContext);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (userContext.validating) {
      return;
    }
    if (!userContext.user) {
      const target = window.location.href.split('/').slice(3).join('/');
      if (target) {
        router.push(`/login?redirect=/${target}`);
      } else {
        router.push('/login');
      }
    } else {
      setReady(true);
    }
  }, [userContext, router]);

  if (!ready || !userContext.user) {
    return (
      <PageTemplate headTitle={rest.title + ' | Loading...'} {...rest}>
        <LinearProgress />
      </PageTemplate>
    );
  }

  // we've guaranteed the user to exist now
  const validUserContext = userContext as ValidUserContextValue;

  return (
    <PageTemplate {...rest}>
      <Children {...validUserContext} />
    </PageTemplate>
  );
}

export function PageTemplate({ title, headTitle = title, maxWidth = 'lg', backLink, children }: PublicPageTemplateProps) {
  return (
    <>
      <Head>
        <title>{headTitle}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainNav />
      <Container maxWidth={maxWidth}>
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