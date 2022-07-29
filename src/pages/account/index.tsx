import React from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Avatar, Grid, Typography } from '@mui/material';

const LoginPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Account" maxWidth='lg'>
      {({ user }) => (
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Avatar src={user.avatarUrl} sx={{ height: 'auto', width: '80%', boxShadow: '0 0 1px rgba(0,0,0,0.8)' }} />
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
      )}
    </UserPageTemplate>
  )
}

export default LoginPage;