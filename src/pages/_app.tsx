import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { createTheme, ThemeProvider } from "@mui/material";
import { ImageContextProvider } from "../hooks/ImageConfigContext";
import "@fontsource/inter/400.css";
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/inter/variable.css"
import "@fontsource/rubik/variable.css"
import { UserContextProvider } from '../hooks/UserContext';
import { CookiesProvider } from 'react-cookie';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F26230', // salmon pink
    },
    secondary: {
      main: '#F2C330', // yellow analagous
    }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  
  return (
    <ThemeProvider theme={theme}>
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