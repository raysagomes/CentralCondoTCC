'use client';
import { useAuth } from '@/modules/auth';
import { useNotificationChecker } from '../../../../hooks/useNotificationChecker';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  useNotificationChecker();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </>
  );
}