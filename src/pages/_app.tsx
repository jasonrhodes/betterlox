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
import { init as initApm } from '@elastic/apm-rum'

initApm({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'Betterlox Frontend',
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'https://betterlox-observability.apm.us-east4.gcp.elastic-cloud.com',
  // Set service version (required for sourcemap feature)
  serviceVersion: '1'
});

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