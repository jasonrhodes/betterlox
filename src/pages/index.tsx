import React from 'react';
import type { NextPage } from 'next';
import { UserPageTemplate } from '../components/PageTemplate';
import { Button } from '@mui/material';

const Home: NextPage = () => {
  return (
    <UserPageTemplate title="Home">
      {({ user, logout }) => (
        <p>Hello, {user.username}! <Button onClick={() => logout()}>Log Out</Button></p>
      )}
    </UserPageTemplate>
  )
}

export default Home;
