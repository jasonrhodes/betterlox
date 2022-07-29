import React from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Alert, AlertTitle, Box, Button, ButtonProps, Checkbox, FormControlLabel, FormGroup, Link as MuiLink } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FormikTextField } from "./formControls/FormikTextField";
import { UserContextValue } from '../hooks/UserContext';
import Link from 'next/link';
import axios, { Axios } from 'axios';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
  rememberMe: yup
    .boolean()
});

type LoginValidationType = yup.InferType<typeof validationSchema>;

interface LoginFormProps {
  userContext: UserContextValue;
}

export const LoginForm: React.FC<LoginFormProps> = ({ userContext }) => {
  const [pageError, setPageError] = React.useState<string | null>(null);
  const formik = useFormik<LoginValidationType>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError, setErrors }) => {
      setPageError(null);
      try {
        const result = await userContext.login({
          email: values.email,
          password: values.password,
          rememberMe: true
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setFieldError('email', 'Invalid email or password');
            setFieldError('password', 'Invalid email or password');
          } else {
            console.log('axios error', error.response?.data);
            setPageError(`Authentication request responded with code ${error.response?.status}`);
          }
        } else {
          console.log("Totally unknown error");
          setPageError(`Sorry, we're having issues with logging in, please try again later.`);
        }
      }
      setSubmitting(false);
    }
  });

  const submitButtonProps: ButtonProps = {
    variant: 'contained',
    color: 'primary',
    type: 'submit',
    sx: {
      my: 2,
      marginRight: 2
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} action="/api/users/register" method="POST">
      {pageError ? <Alert sx={{ my: 2 }} severity="error"><AlertTitle>Unexpected Server Error</AlertTitle>{pageError}</Alert> : null}
      <FormikTextField<LoginValidationType>
        fullWidth
        formik={formik as any} // TODO: these are giving me some ridiculous problem about FormikValues that I can't solve
        required={true}
        id='email'
        label='Email'
      />
      <FormikTextField<LoginValidationType>
        fullWidth
        formik={formik as any} // TODO: fix also
        required={true}
        id='password'
        label='Password'
        type='password'
        autoComplete='current-password'
      />
      <FormGroup sx={{ display: "flex", flexDirection: "row", alignContent: "space-between" }}>
        {/* <FormControlLabel 
          control={<Checkbox
            id="rememberMe"
            name="rememberMe"
            disabled={false}
            value={true}
            onChange={formik.handleChange}
          />}
          label="Remember me?"
        /> */}
        
      </FormGroup>
      {formik.isSubmitting
        ? <LoadingButton loading {...submitButtonProps}>Logging in ...</LoadingButton>
        : (
          <Box sx={{ verticalAlign: 'middle', paddingTop: '9px' }}>
            <Button {...submitButtonProps}>Log In</Button>
            <Link href="/forgot-password" passHref>
              <MuiLink>I forgot my password</MuiLink>
            </Link>
          </Box>
        )}
    </form>
  )
}

