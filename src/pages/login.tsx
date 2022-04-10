import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { UserContextConsumer } from '../hooks/UserContext';
import { useRouter } from 'next/router';
import { LoginForm } from '../components/LoginForm';
import { useCookies } from 'react-cookie';

const LoginPage: NextPage = () => {
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['rememberMe']);
  return (
    <PageTemplate title="Log In" isPublic={true} maxWidth='sm'>
      <UserContextConsumer>
        {context => {
          if (!context) {
            return <p>An error occurred while trying to load this page.</p>;
          }
          if (context.user) {
            router.push('/');
            return;
          }
          return <LoginForm userContext={context} />
        }}
      </UserContextConsumer>
    </PageTemplate>
  )
}

export default LoginPage;