import React, { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import { Box, Breakpoint, Button, CircularProgress, Container, LinearProgress, Typography } from '@mui/material';
import { MainNav } from "./MainNav";
import Link from 'next/link';
import { UserContext, ValidUserContextValue } from '../hooks/UserContext';
import { useRouter } from 'next/router';

export interface BackLinkProps {
  url: string;
  text?: string;
}

type ChildrenFunction = (props: ValidUserContextValue) => JSX.Element | null;
export interface PublicPageTemplateProps {
  title: string;
  headTitle?: string;
  backLink?: BackLinkProps;
  avatarUrl?: string;
  maxWidth?: false | Breakpoint;
  children: React.ReactNode;
  titleLineRightContent?: JSX.Element;
  loggedIn?: boolean;
}
export interface UserPageTemplateProps extends PublicPageTemplateProps {
  children: ChildrenFunction;
  isAdmin?: boolean;
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

export const UserPageTemplate: React.FC<UserPageTemplateProps> = ({ children: Children, isAdmin, ...rest }) => {
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
    } else if (isAdmin && userContext.user.id !== 1) {
      router.replace('/films');
    } else {
      setReady(true);
    }
  }, [userContext, router, isAdmin]);

  if (!ready || !userContext.user) {
    return (
      <PageTemplate headTitle={rest.title + ' | Loading...'} {...rest}>
        <LinearProgress />
      </PageTemplate>
    );
  }

  // we've guaranteed the user will exist now
  const validUserContext = userContext as ValidUserContextValue;

  return (
    <PageTemplate {...rest}>
      <Children {...validUserContext} />
    </PageTemplate>
  );
}

export function PageTemplate({
  title, 
  headTitle = title, 
  maxWidth = 'lg', 
  backLink, 
  children, 
  titleLineRightContent, 
  loggedIn 
}: PublicPageTemplateProps) {
  return (
    <>
      <Head>
        <title>{headTitle}</title>
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {backLink && backLink.url ? <BackLink {...backLink} /> : null}
            <Box sx={{ flexShrink: 1 }}>
              <Typography component='h1' variant='h1' gutterBottom={true}>{title}</Typography>
            </Box>
            {titleLineRightContent ? <RightContent content={titleLineRightContent} /> : null}
          </Box>
          {children}
        </Box>
      </Container>
    </>
  );
}

function RightContent({ content }: { content: JSX.Element }) {
  return (
    <Box sx={{ marginLeft: "auto" }}>
      {content}
    </Box>
  )
}