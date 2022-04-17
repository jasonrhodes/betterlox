import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../../components/PageTemplate';
import { UserContextConsumer } from '../../hooks/UserContext';
import { Avatar, Button, Grid, Paper, Typography } from '@mui/material';
import Link from '../../components/Link';

const LoginPage: NextPage = () => {
  return (
    <PageTemplate title="Sync Data" isPublic={false} maxWidth='md'>
      <UserContextConsumer>
        {context => {
          if (!context || !context.user) {
            return <p>An error occurred while trying to load this page.</p>;
          }
          const { user } = context;
          return (
            <Paper elevation={2} sx={{ pt: 3, pb: 8, px: 5 }}>
              <Avatar src={user.avatarUrl} sx={{ height: 100, width: 100, mb: 2 }} />
              <Typography sx={{ mb: 5 }} variant="body1" component="div">Syncing your data will gather your <Link href={`https://letterboxd.com/${user.letterboxdUsername}/films/ratings`}>ratings</Link> and <Link href={`https://letterboxd.com/${user.letterboxdUsername}/lists`}>lists</Link> (coming soon) from Letterboxd and make them available here.</Typography>
              <Button variant="contained" sx={{ mr: 2 }}>Sync My Data</Button>
              <Button>Remove My Data</Button>
            </Paper>
          );  
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default LoginPage;