import type { AppProps } from 'next/app';
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ImageContextProvider } from "../hooks/ImageConfigContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/inter/variable.css"
import "@fontsource/rubik/variable.css"
import { UserContextProvider } from '../hooks/UserContext';
import { CookiesProvider } from 'react-cookie';

const theme = createTheme({
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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CookiesProvider>
        <ImageContextProvider>
          <UserContextProvider>
            <Component {...pageProps} />
          </UserContextProvider>
        </ImageContextProvider>
      </CookiesProvider>
    </ThemeProvider>
  );
}

export default MyApp;