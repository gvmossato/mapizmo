'use client';

import ColorSchemeProvider from '@/providers/ColorScheme';
import Head from 'next/head';
import { ReactNode } from 'react';
import '../styles/globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <Head>
        <title>MAPIZMO</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <ColorSchemeProvider>
        <body>{children}</body>
      </ColorSchemeProvider>
    </html>
  );
}
