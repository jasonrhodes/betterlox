import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { UserContextConsumer } from '../hooks/UserContext';
import { useRouter } from 'next/router';
import { RegistrationForm } from '../components/RegistrationForm';
import { Alert, Typography } from '@mui/material';
import { AppLink } from '../components/AppLink';

const RegistrationClosedBanner = () => {
  return (
    <div style={{ marginBottom: "1em" }}>
      <Alert severity="warning">Notice: Betterlox registration is temporarily closed.</Alert>
    </div>
  )
}

const RegisterPage: NextPage = () => {
  const registrationIsClosed = process.env.NEXT_PUBLIC_REGISTRATION_CLOSED === "true";
  const router = useRouter();
  return (
    <PageTemplate title="Create Account" maxWidth='sm'>
      {registrationIsClosed ? <RegistrationClosedBanner /> : null}
      <Typography>Already have an account? <AppLink color="secondary" href="/login">Log in instead.</AppLink></Typography>
      <UserContextConsumer>
        {context => {
          if (!context) {
            return <p>An error occurred while trying to load this page.</p>;
          }
          if (context.user) {
            router.push('/');
            return;
          }
          return <RegistrationForm isOpen={!registrationIsClosed} />
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default RegisterPage;