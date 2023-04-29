import React from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { useRouter } from 'next/router';
import { singleQueryParam } from "@rhodesjason/loxdb/dist/lib/queryParams";

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const token = singleQueryParam(router.query.token) || '';
  return (
    <PageTemplate title="Choose New Password" maxWidth='md'>
      <ResetPasswordForm token={token} />
    </PageTemplate>
  );
}

export default ResetPasswordPage;