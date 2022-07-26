import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { UserContextConsumer } from '../hooks/UserContext';
import { useRouter } from 'next/router';
import { RegistrationForm } from '../components/RegistrationForm';
import Link from 'next/link';
import { Typography } from '@mui/material';

const RegisterPage: NextPage = () => {
  const router = useRouter();
  return (
    <PageTemplate title="Create Account" maxWidth='sm'>
      <Typography>Already have an account? <Link href="/login">Log in instead.</Link></Typography>
      <UserContextConsumer>
        {context => {
          if (!context) {
            return <p>An error occurred while trying to load this page.</p>;
          }
          if (context.user) {
            router.push('/');
            return;
          }
          return <RegistrationForm />
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default RegisterPage;