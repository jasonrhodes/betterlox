import React from 'react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { Box, Button, ButtonProps, Checkbox, FormControlLabel, FormGroup, Link as MuiLink } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { FormikTextField } from "./formControls/FormikTextField";
import { UserContextValue } from '../hooks/UserContext';
import Link from 'next/link';

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
  const formik = useFormik<LoginValidationType>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const result = await userContext.login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe
      });
      setSubmitting(false);
    },
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

