import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';

const ForgotPasswordPage: NextPage = () => {
  return (
    <PageTemplate title="Reset Password" maxWidth='md'>
      <ForgotPasswordForm />
    </PageTemplate>
  )
}

export default ForgotPasswordPage;