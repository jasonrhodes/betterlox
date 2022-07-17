import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate, UserPageTemplate } from '../../components/PageTemplate';
import { UserContextConsumer } from '../../hooks/UserContext';
import { Avatar, Grid, Paper, Typography } from '@mui/material';

const LoginPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Account" maxWidth='md'>
      {({ user }) => (
        <Paper elevation={2} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Avatar src={user.avatarUrl} sx={{ height: 'auto', width: '80%' }} />
          </Grid>
          <Grid item xs={9}>
            <Typography sx={{ fontWeight: 'bold' }}>Email</Typography>
            <Typography gutterBottom>{user.email}</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
            <Typography gutterBottom>{user.name}</Typography>
            <Typography sx={{ fontWeight: 'bold' }}>Letterboxd Username</Typography>
            <Typography gutterBottom>{user.username}</Typography> 
          </Grid>
        </Grid>
      </Paper>
      )}
    </UserPageTemplate>
  )
}

export default LoginPage;