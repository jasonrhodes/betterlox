import React from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../../components/PageTemplate';
import { Avatar, Button, Box, Typography, Link } from '@mui/material';

const LoginPage: NextPage = () => {
  return (
    <UserPageTemplate title="Sync Data" maxWidth='lg'>
      {({ user }) => (
        <Box>
          <Avatar src={user.avatarUrl} sx={{ height: 100, width: 100, mb: 2, boxShadow: "0 0 1px rgba(0,0,0,0.8)" }} />
          <Typography sx={{ mb: 5 }} variant="body1" component="div">Syncing your data will gather your latest <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/films/ratings`}>ratings</Link> and <Link target="_blank" rel="noreferrer" href={`https://letterboxd.com/${user.username}/lists`}>lists</Link> (coming soon) from Letterboxd and make them available here.</Typography>
          <Typography variant="h6">Note: This functionality is not yet ready.</Typography>
          <Box sx={{ py: 5 }}>
            <Button disabled={true} variant="contained" sx={{ mr: 2 }}>Sync My Data</Button>
            <Button disabled={true}>Remove My Data</Button>
          </Box>
        </Box>
      )}
    </UserPageTemplate>
  )
}

export default LoginPage;