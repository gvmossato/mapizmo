'use client';

import { CssBaseline } from '@mui/material';
import {
  Experimental_CssVarsProvider as CssVariablesProvider,
  experimental_extendTheme as extendTheme,
} from '@mui/material/styles';
import { ReactNode } from 'react';

export default function ColorSchemeProvider({ children }: { children: ReactNode }) {
  const commonColors = {
    primary: { light: '#5fac5d', main: '#379835', dark: '#266a25' },
    secondary: { light: '#d34346', main: '#c91518', dark: '#8c0e10' },
  };

  const theme = extendTheme({
    colorSchemes: {
      light: {
        palette: {
          ...commonColors,
          background: { default: '#ffffff', paper: '#eeeeee' },
        },
      },
      dark: {
        palette: {
          ...commonColors,
          background: { default: '#121212', paper: '#1e1e1e' },
        },
      },
    },
  });

  return (
    <CssVariablesProvider theme={theme}>
      <CssBaseline />
      {children}
    </CssVariablesProvider>
  );
}
