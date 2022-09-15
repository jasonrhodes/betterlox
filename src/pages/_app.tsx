import type { AppProps } from 'next/app';
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ImageContextProvider } from "../hooks/ImageConfigContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/inter/variable.css"
import "@fontsource/rubik/variable.css"
import { UserContextProvider } from '../hooks/UserContext';
import { CookiesProvider } from 'react-cookie';
import { init as initApm } from '@elastic/apm-rum';
import { theme } from "../theme";
import { GlobalFiltersContextProvider } from '../hooks/GlobalFiltersContext';
import Head from 'next/head';

initApm({
  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: 'Betterlox Frontend',
  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'https://betterlox-observability.apm.us-east4.gcp.elastic-cloud.com',
  // Set service version (required for sourcemap feature)
  serviceVersion: '1'
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/img/logo/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/img/logo/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/img/logo/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/img/logo/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/img/logo/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/img/logo/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/img/logo/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/img/logo/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/logo/apple-touch-icon-180x180.png" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CookiesProvider>
          <ImageContextProvider>
            <UserContextProvider>
              <GlobalFiltersContextProvider>
                <Component {...pageProps} />
              </GlobalFiltersContextProvider>
            </UserContextProvider>
          </ImageContextProvider>
        </CookiesProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;