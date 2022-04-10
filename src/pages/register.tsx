import React, { useState } from 'react';
import type { NextPage } from 'next';
import { PageTemplate } from '../components/PageTemplate';
import { UserContextConsumer } from '../hooks/UserContext';
import { useRouter } from 'next/router';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Avatar, Button, ButtonProps, CircularProgress, TextField, TextFieldProps, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import api from '../lib/callApi';
import { getUserDetails } from '../lib/letterboxd';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

const RegisterPage: NextPage = () => {
  const router = useRouter();
  return (
    <PageTemplate title="Create Account" isPublic={true} maxWidth='md'>
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

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  letterboxdUsername: yup
    .string()
    .required('Letterboxd Username is required')
});

type RegisterValidationType = yup.InferType<typeof validationSchema>;

// Note: ID is required and must match the formik key
type WrappedTextFieldProps = TextFieldProps & {
  formik: ReturnType<typeof useFormik>,
  id: keyof RegisterValidationType
}

const WrappedTextField = ({ formik, id, ...textFieldProps }: WrappedTextFieldProps) => (
  <TextField
    id={id}
    name={id}
    disabled={formik.isSubmitting}
    margin='normal'
    {...textFieldProps}
    value={formik.values[id]}
    onChange={formik.handleChange}
    error={formik.touched[id] && Boolean(formik.errors[id])}
    helperText={formik.touched[id] && formik.errors[id]}
  />
)

interface LetterboxdDetailState {
  retrieved: boolean;
  details?: Awaited<ReturnType<typeof getUserDetails>>;
}

const RegistrationForm = () => {
  const [letterboxdDetails, setLetterboxdDetails] = useState<LetterboxdDetailState>({
    retrieved: false
  });
  const [letterboxdLookupLoading, setLLL] = useState(false);
  const formik = useFormik<RegisterValidationType>({
    initialValues: {
      email: '',
      password: '',
      letterboxdUsername: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const { details } = letterboxdDetails;
      if (!details) {
        throw new Error('Account registration blew up because no info has been retrieved from letterboxd, boooooo');
      }
      await api.register({
        email: values.email,
        password: values.password,
        avatarUrl: details.avatarUrl,
        letterboxdUsername: values.letterboxdUsername,
        letterboxdName: details.name,
        letterboxdAccountLevel: details.isPatron ? 'patron' : details.isPro ? 'pro' : 'basic'
      });
      setSubmitting(false);
    },
  });

  let letterboxdStatus = null;
  
  if (letterboxdLookupLoading) {
    letterboxdStatus = <CircularProgress />;
  } else if (letterboxdDetails.retrieved && letterboxdDetails.details && letterboxdDetails.details.avatarUrl) {
    letterboxdStatus = (
      <Avatar src={letterboxdDetails.details.avatarUrl} />
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
    color: 'primary',
    type: 'submit',
    sx: {
      my: 2
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} action="/api/users/register" method="POST">
      <WrappedTextField
        fullWidth
        formik={formik as any} // TODO: these are giving me some ridiculous problem about FormikValues that I can't solve
        required={true}
        id='email'
        label='Email'
      />
      <WrappedTextField
        fullWidth
        formik={formik as any} // TODO: fix also
        required={true}
        id='letterboxdUsername'
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
          if ('errorMessage' in data) {
            setLetterboxdDetails({ retrieved: true });
            return;
          }
          setLetterboxdDetails({ retrieved: true, details: data.details });
        }}
      />
      <WrappedTextField
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
        : <Button {...submitButtonProps}>Create Account</Button>}
    </form>
  )
}

export default RegisterPage;