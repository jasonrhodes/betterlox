import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { createTheme, ThemeProvider } from "@mui/material";
import { ImageContextProvider } from "../hooks/ImageConfigContext";
import "@fontsource/inter/400.css";
import "@fontsource/inter/variable.css"
import { UserContextProvider } from '../hooks/UserContext';
import { CookiesProvider } from 'react-cookie';

const theme = createTheme({
  // palette: {
  //   primary: {
  //     main: '#FA8072', // salmon pink - tetradic theme: https://www.canva.com/colors/color-wheel/print/fa8072+a8fa72+72ecfa+c472fa/
  //   },
  //   secondary: {
  //     main: '#72ECFA', // blue
  //   },
  // },
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