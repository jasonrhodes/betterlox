import React from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Box, Button, ButtonProps, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FormikTextField } from "./formControls/FormikTextField";
import api from '../lib/callApi';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required')
});

type ForgotPasswordValidationType = yup.InferType<typeof validationSchema>;

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = React.useState<'pending' | 'done'>('pending');

  const formik = useFormik<ForgotPasswordValidationType>({
    initialValues: {
      email: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.forgotPassword({ email: values.email });
      } catch (error: unknown) {
        // ignore errors
        console.error(error);
      }
      setSubmitted("done");
      setSubmitting(false);
    },
  });

  const submitButtonProps: ButtonProps = {
    variant: 'contained',
    color: 'primary',
    type: 'submit',
    sx: {
      my: 2
    }
  };

  if (submitted === "done") {
    return (
      <Box>
        <Typography>
          <strong>Thanks!</strong> Please check your email. If you didn&apos;t receive instructions, just wait longer.
        </Typography>
      </Box>
    ); 
  }

  return (
    <form onSubmit={formik.handleSubmit} action="/api/users/forgot-password" method="POST">
      <Typography>Enter your account email and we&apos;ll send you instructions to reset your password.</Typography>
      <FormikTextField<ForgotPasswordValidationType>
        fullWidth
        formik={formik as any} // TODO: these are giving me some ridiculous problem about FormikValues that I can't solve
        required={true}
        id='email'
        label='Email'
      />
      {formik.isSubmitting
        ? <LoadingButton loading {...submitButtonProps}>Sending ...</LoadingButton>
        : <Button {...submitButtonProps}>Reset</Button>}
    </form>
  );
}

