import React from 'react';
import Head from 'next/head';
import { Avatar, Box, Container, Typography } from '@mui/material';
import { MainNav } from "./MainNav";
import Link from './Link';
import { BasicImage } from './images';

export interface BackLinkProps {
  url: string;
  text?: string;
}

export interface PageTemplateProps {
  title: string;
  backLink?: BackLinkProps;
  avatarUrl?: string;
}

const BackLink: React.FC<BackLinkProps> = ({ url, text = 'Go Back' }) => {
  return <Typography variant='h6'><Link variant="button" href={url}>← {text}</Link></Typography>;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({ title, backLink, children, avatarUrl }) => {
  const headingStyles = avatarUrl ? {
    float: 'left',
    width: 500,
    lineHeight: '150px'
  } : {};

  return (
    <>
      <MainNav />
      <Container maxWidth="lg">
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
              <Typography sx={headingStyles} variant='h3' gutterBottom={true}>{title}</Typography>
            </Box>
          </Box>
          {children}
        </Box>
      </Container>
    </>
  )
}