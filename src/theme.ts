import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: '#011e3c',
      paper: '#011e3c'
    },
    primary: {
      main: '#FA8072', // salmon pink
      dark: '#F06B64'
    },
    secondary: {
      main: '#72ECFA', // blue complementary
      dark: '#07b7cc'
    }
  },
  typography: {
    fontFamily: '"Rubik", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '36px',
      fontWeight: 400
    }
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#fff',
      paper: '#fff'
    },
    primary: {
      main: theme.palette.primary.dark
    },
    secondary: {
      main: theme.palette.secondary.dark
    }
  }
})

export type BetterloxDarkTheme = typeof theme;