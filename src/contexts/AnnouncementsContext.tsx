'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
  author: { name: string };
}

interface AnnouncementsContextType {
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  setAnnouncements: (announcements: Announcement[]) => void;
}

const AnnouncementsContext = createContext<AnnouncementsContextType | undefined>(undefined);

export function AnnouncementsProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncementsState] = useState<Announcement[]>([
    {
      id: 1,
      title: 'Manutenção do Elevador',
      content: 'Informamos que o elevador social passará por manutenção preventiva no dia 15/01 das 8h às 17h.',
      priority: 'HIGH',
      createdAt: new Date().toISOString(),
      author: { name: 'Administração' }
    },
    {
      id: 2,
      title: 'Reunião de Condomínio',
      content: 'Convocamos todos os condôminos para a reunião ordinária que acontecerá no dia 20/01 às 19h no salão de festas.',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      author: { name: 'Síndico' }
    }
  ]);

  const addAnnouncement = (newAnnouncement: Omit<Announcement, 'id' | 'createdAt'>) => {
    const announcement: Announcement = {
      ...newAnnouncement,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setAnnouncementsState(prev => [announcement, ...prev]);
  };

  const setAnnouncements = (newAnnouncements: Announcement[]) => {
    setAnnouncementsState(newAnnouncements);
  };

  return (
    <AnnouncementsContext.Provider value={{ announcements, addAnnouncement, setAnnouncements }}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementsContext);
  if (!context) {
    throw new Error('useAnnouncements must be used within AnnouncementsProvider');
  }
  return context;
}