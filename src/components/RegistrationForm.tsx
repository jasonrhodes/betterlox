import React, { useState } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Alert, AlertTitle, Avatar, Button, ButtonProps, CircularProgress, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import api from '../lib/callApi';
import { getUserDetails } from '../lib/letterboxd';
import { CheckCircle, Details, Error as ErrorIcon } from '@mui/icons-material';
import { FormikTextField } from "./formControls/FormikTextField";
import { useRouter } from 'next/router';
import { AxiosError } from 'axios';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  username: yup
    .string()
    .required('Valid Letterboxd username is required')
});

type RegisterValidationType = yup.InferType<typeof validationSchema>;

interface LetterboxdDetailState {
  retrieved: boolean;
  details?: Awaited<ReturnType<typeof getUserDetails>>;
}

export const RegistrationForm = () => {
  const [pageError, setPageError] = useState<string | null>(null);
  const [letterboxdDetails, setLetterboxdDetails] = useState<LetterboxdDetailState>({
    retrieved: false
  });
  const [letterboxdLookupLoading, setLLL] = useState(false);
  const router = useRouter();
  const formik = useFormik<RegisterValidationType>({
    initialValues: {
      email: '',
      password: '',
      username: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setPageError(null);
      const { details } = letterboxdDetails;
      if (!details) {
        throw new Error('Account registration blew up because no info has been retrieved from letterboxd, boooooo');
      }
      try {
        await api.register({
          email: values.email,
          password: values.password,
          avatarUrl: details.avatarUrl,
          username: values.username,
          name: details.name,
          letterboxdAccountLevel: details.isPatron ? 'patron' : details.isPro ? 'pro' : 'basic'
        });
        setSubmitting(false);
        router.push("/login");
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
          setFieldError("email", "Email already exists, log in instead?");
        } else {
          setPageError("We're having problems with registration right now, please try again later.");
        }
      }
    },
  });

  let letterboxdStatus = null;
  
  if (letterboxdLookupLoading) {
    letterboxdStatus = <CircularProgress />;
  } else if (letterboxdDetails.retrieved && letterboxdDetails.details && letterboxdDetails.details.avatarUrl) {
    letterboxdStatus = (
      <Avatar src={letterboxdDetails.details.avatarUrl} sx={{ boxShadow: "0 0 1px rgba(0,0,0,0.8)"}} />
    );
  } else if (
    letterboxdDetails.retrieved && 
    letterboxdDetails.details && 
    letterboxdDetails.details.name.length > 0 && 
    letterboxdDetails.details.avatarUrl.length > 0
  ) {
    letterboxdStatus = <CheckCircle color='success' />
  } else if (letterboxdDetails.retrieved) {
    letterboxdStatus = <Tooltip title='We had trouble finding this Letterboxd account' arrow><ErrorIcon color='error' /></Tooltip>;
  }

  const submitButtonProps: ButtonProps = {
    variant: 'contained',
    color: 'secondary',
    type: 'submit',
    sx: {
      my: 2
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} action="/api/users/register" method="POST">
      {pageError ? <Alert sx={{ my: 2 }} severity="warning"><AlertTitle>Unexpected Server Error</AlertTitle>{pageError}</Alert> : null}
      <FormikTextField<RegisterValidationType>
        fullWidth
        formik={formik as any} // TODO: these are giving me some ridiculous problem about FormikValues that I can't solve
        required={true}
        id='email'
        label='Email'
      />
      <FormikTextField<RegisterValidationType>
        fullWidth
        formik={formik as any} // TODO: fix also
        required={true}
        id='username'
        label='Letterboxd Username'
        InputProps={{
          endAdornment: letterboxdStatus
        }}
        onBlur={async (e) => {
          if (e.target.value === '') {
            setLetterboxdDetails({ retrieved: false });
            return;
          }
          setLLL(true);
          const { data } = await api.getLetterboxdUserDetails(e.target.value);
          setLLL(false);
          if ('code' in data) {
            setLetterboxdDetails({ retrieved: true });
            return;
          }
          setLetterboxdDetails({ retrieved: true, details: data.details });
        }}
      />
      <FormikTextField<RegisterValidationType>
        fullWidth
        formik={formik as any} // TODO: fix also
        required={true}
        id='password'
        label='Password'
        type='password'
        autoComplete='new-password'
      />
      {formik.isSubmitting
        ? <LoadingButton loading {...submitButtonProps}>Creating Account ...</LoadingButton>
        : <Button {...submitButtonProps} disabled={!letterboxdDetails?.details?.avatarUrl || !letterboxdDetails?.details?.name}>Create Account</Button>}
    </form>
  )
}