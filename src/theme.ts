import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: '#011e3c'
    },
    primary: {
      main: '#FA8072', // salmon pink
      dark: '#DB1D08'
    },
    secondary: {
      main: '#72ECFA', // blue complementary
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

export type BetterloxTheme = typeof theme;