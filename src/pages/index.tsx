import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { UserContextConsumer } from '../hooks/UserContext';
import { Button } from '@mui/material';

const Home: NextPage = () => {
  return (
    <PageTemplate title="Home">
      <UserContextConsumer>
        {context => {
          if (!context) {
            return <p>Context is missing, oof!</p>;
          }
          if (!context.user) {
            return <p>You are not logged in. <Button onClick={() => context.login("a", "b")}>Log In</Button></p>
          }
          return <p>Hello, {context.user.letterboxd}! <Button onClick={() => context.logout()}>Log Out</Button></p>
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default Home;
