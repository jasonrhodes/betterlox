import { TextFieldProps, TextField } from "@mui/material";
import { useFormik } from "formik";

// Note: ID is required and must match the formik key
type FormikTextFieldProps<T extends object> = TextFieldProps & {
  formik: ReturnType<typeof useFormik>,
  id: keyof T
}

export const FormikTextField = <T extends object>({ formik, id, ...textFieldProps }: FormikTextFieldProps<T>) => (
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