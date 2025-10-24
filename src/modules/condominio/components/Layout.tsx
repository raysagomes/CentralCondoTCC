'use client';

import React from 'react';
import { useAuth } from '@/modules/auth';
import Sidebar from '@/modules/condominio/components/Layout/Sidebar';
import Header from '@/modules/condominio/components/Layout/Header';
import Footer from '@/modules/condominio/components/Layout/Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  // Sem layout quando não autenticado (ex.: páginas /auth)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-20 px-4">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}