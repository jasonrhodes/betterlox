import React, { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler, useState } from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Avatar, Box, CircularProgress, Divider, FormControl, Grid, TextField, Typography } from '@mui/material';
import { useCurrentUser } from '../../hooks/UserContext';
import { UserSettings } from "@rhodesjason/loxdb/dist/db/entities";
import { UserSettingStatsMinCastOrder, UserSettingStatsMinWatched } from '../../components/settings/settingsFields';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Typography color="primary" variant="h6">{children}</Typography>
      <Divider sx={{ marginTop: 1, marginBottom: 3 }} />
    </>
  )
}



const LoginPage: NextPage = () => {
  return (
    <UserPageTemplate title="My Account" maxWidth='lg'>
      {({ user }) => (
        <Grid container spacing={5}>
          <Grid item xs={12} md={6}>
            <SectionHeading>Profile</SectionHeading>
            <Box sx={{ marginBottom: 3 }}>
              <Typography sx={{ fontWeight: 'bold', my: 1 }}>Email</Typography>
              <Typography gutterBottom>{user.email}</Typography>
            </Box>
            <Box sx={{ marginBottom: 3 }}>
              <Typography sx={{ fontWeight: 'bold', my: 1 }}>Name</Typography>
              <Typography gutterBottom>{user.name}</Typography>
            </Box>
            <Box sx={{ marginBottom: 3 }}>
              <Typography sx={{ fontWeight: 'bold', my: 1 }}>Letterboxd Username</Typography>
              <Box sx={{ display: 'flex' }}>
                <Avatar 
                  src={user.avatarUrl} 
                  sx={{ 
                    height: 25, 
                    width: 25, 
                    boxShadow: '0 0 1px rgba(0,0,0,0.8)',
                    marginRight: 1
                  }} 
                />
                <Typography gutterBottom>{user.username}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionHeading>Settings</SectionHeading>
            <Box sx={{ mb: 4 }}>
              <UserSettingStatsMinWatched />
            </Box>
            <Box sx={{ mb: 4 }}>
              <UserSettingStatsMinCastOrder />
            </Box>
          </Grid>
        </Grid>
      )}
    </UserPageTemplate>
  )
}

export default LoginPage;