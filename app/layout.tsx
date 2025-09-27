import React from 'react';
import './globals.css';
import Header from '@/components/Layout/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Header />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}
