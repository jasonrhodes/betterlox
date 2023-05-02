import React, { useState } from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Alert, AlertTitle, Avatar, Button, ButtonProps, CircularProgress, Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import api from '../lib/callApi';
import { getUserDetails } from '@rhodesjason/loxdb/dist/lib/letterboxd';
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

export interface RegistrationFormProps {
  isOpen?: boolean;
}

export const RegistrationForm = ({ isOpen = true }: RegistrationFormProps) => {
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
      if (!details || !details.found) {
        setFieldError('username', 'Invalid Letterboxd username');
        return;
      }
      try {
        await api.register({
          email: values.email,
          password: values.password,
          username: values.username,
          name: details.name,
          letterboxdAccountLevel: details.isPatron ? 'patron' : details.isPro ? 'pro' : 'basic'
        });
        setSubmitting(false);
        router.push("/login");
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 409) {
          setFieldError("email", "Email already exists, log in instead?");
        } else if (error instanceof AxiosError) {
          setPageError(`We're having problems with registration right now. Sorry! [${error.response?.status}] ${error.message}`);
          console.log('REGISTRATION ERROR', error.message, error.response?.status);
        } else {
          setPageError("We're having problems with registration right now, please try again later.");
        }
      }
    },
  });

  let letterboxdStatus = null;
  const { details } = letterboxdDetails;
  
  if (letterboxdLookupLoading) {
    letterboxdStatus = <CircularProgress />;
  } else if (letterboxdDetails.retrieved && details?.found && details?.avatarUrl) {
    letterboxdStatus = (
      <Avatar src={details.avatarUrl} sx={{ boxShadow: "0 0 1px rgba(0,0,0,0.8)"}} />
    );
  } else if (
    letterboxdDetails.retrieved && 
    details?.found && 
    details.name.length > 0 && 
    details.avatarUrl.length > 0
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
      <fieldset disabled={!isOpen} style={{ border: "none", padding: 0, margin: 0 }}>
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
          : <Button disabled={!isOpen} {...submitButtonProps}>Create Account</Button>}
      </fieldset>
    </form>
  )
}