'use client';

import React from 'react';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext'; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
