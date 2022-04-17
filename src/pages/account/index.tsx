import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../../components/PageTemplate';
import { UserContextConsumer } from '../../hooks/UserContext';
import { Avatar, Grid, Paper, Typography } from '@mui/material';

const LoginPage: NextPage = () => {
  return (
    <PageTemplate title="My Account" isPublic={false} maxWidth='md'>
      <UserContextConsumer>
        {context => {
          if (!context || !context.user) {
            return <p>An error occurred while trying to load this page.</p>;
          }
          const { user } = context;
          return (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Avatar src={user.avatarUrl} sx={{ height: 'auto', width: '80%' }} />
                </Grid>
                <Grid item xs={9}>
                  <Typography sx={{ fontWeight: 'bold' }}>Email</Typography>
                  <Typography gutterBottom>{user.email}</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
                  <Typography gutterBottom>{user.letterboxdName}</Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>Letterboxd Username</Typography>
                  <Typography gutterBottom>{user.letterboxdUsername}</Typography> 
                </Grid>
              </Grid>
            </Paper>
          );  
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default LoginPage;