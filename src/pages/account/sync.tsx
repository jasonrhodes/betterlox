import React from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Avatar, Button, Grid, Paper, Typography } from '@mui/material';
import Link from 'next/link';

const LoginPage: NextPage = () => {
  return (
    <UserPageTemplate title="Sync Data" maxWidth='lg'>
      {({ user }) => (
        <Paper elevation={2} sx={{ pt: 3, pb: 8, px: 5 }}>
          <Avatar src={user.avatarUrl} sx={{ height: 100, width: 100, mb: 2, boxShadow: "0 0 1px rgba(0,0,0,0.8)" }} />
          <Typography sx={{ mb: 5 }} variant="body1" component="div">Syncing your data will gather your <Link href={`https://letterboxd.com/${user.username}/films/ratings`}>ratings</Link> and <Link href={`https://letterboxd.com/${user.username}/lists`}>lists</Link> (coming soon) from Letterboxd and make them available here.</Typography>
          <Button variant="contained" sx={{ mr: 2 }}>Sync My Data</Button>
          <Button>Remove My Data</Button>
        </Paper>
      )}
    </UserPageTemplate>
  )
}

export default LoginPage;