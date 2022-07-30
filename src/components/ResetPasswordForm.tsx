import React from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FormikTextField } from "./formControls/FormikTextField";
import api from '../lib/callApi';
import { useRouter } from 'next/router';

const validationSchema = yup.object({
  updatedPassword: yup
    .string()
    .required('New password is required')
});

type ResetPasswordValidationType = yup.InferType<typeof validationSchema>;

export function ResetPasswordForm({ token }: { token: string }) {
  const [error, setError] = React.useState('');
  const router = useRouter();
  const formik = useFormik<ResetPasswordValidationType>({
    initialValues: {
      updatedPassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await api.resetPassword({ token, updatedPassword: values.updatedPassword });
        if (response.status === 200) {
          router.push("/login");
        } else {
          const message = (response.data.message) ? response.data.message : 'Unknown error occurred';
          setError(message);
          setSubmitting(false);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : typeof error === "string" ? error : "Unknown error occurred";
        setError(message);
        console.error(message);
        setSubmitting(false);
      }
    },
  });

  const submitButtonProps: ButtonProps = {
    variant: 'contained',
    color: 'secondary',
    type: 'submit',
    sx: {
      my: 2
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} action="/api/users/reset-password" method="POST">
      <FormikTextField<ResetPasswordValidationType>
        fullWidth
        formik={formik as any} // TODO: these are giving me some ridiculous problem about FormikValues that I can't solve
        required={true}
        id='updatedPassword'
        label='Choose a new password'
        type='password'
        autoComplete='new-password'
      />
      {error ? <Box><Typography color="red">{error}</Typography></Box> : null}
      {formik.isSubmitting
        ? <LoadingButton loading {...submitButtonProps}>Updating ...</LoadingButton>
        : <Button {...submitButtonProps}>Reset</Button>}
    </form>
  );
}

