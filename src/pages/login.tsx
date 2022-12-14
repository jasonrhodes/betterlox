import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { UserContextConsumer } from '../hooks/UserContext';
import { useRouter } from 'next/router';
import { LoginForm } from '../components/LoginForm';
import { Typography } from '@mui/material';
import { AppLink } from '../components/AppLink';

const LoginPage: NextPage = () => {
  const router = useRouter();
  return (
    <PageTemplate title="Log In" maxWidth='sm'>
      <Typography>Don&apos;t have an account? <AppLink href="/register" color="secondary">Register instead.</AppLink></Typography>
      <UserContextConsumer>
        {context => {
          if (!context) {
            return <p>An error occurred while trying to load this page.</p>;
          }
          if (context.user) {
            router.push('/films');
            return;
          }
          return <LoginForm userContext={context} />
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default LoginPage;