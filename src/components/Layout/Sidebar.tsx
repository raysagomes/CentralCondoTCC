'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import {
  FaProjectDiagram,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaUsers,
  FaUser,
  FaPuzzlePiece
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { BsFileText } from 'react-icons/bs';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: MdDashboard, path: '/dashboard', label: 'Dashboard', bgColor: 'bg-blue-500' },
  { icon: BsFileText, path: '/avisos', label: 'Avisos', bgColor: 'bg-cyan-400' },
  { icon: FaProjectDiagram, path: '/projects', label: 'Projetos', bgColor: 'bg-green-400' },
  { icon: FaCalendarAlt, path: '/calendar', label: 'Calendário', bgColor: 'bg-yellow-300' },
  { icon: FaUsers, path: '/members', label: 'Membros', bgColor: 'bg-purple-400' },
  { icon: FaMoneyBillWave, path: '/payments', label: 'Pagamentos', bgColor: 'bg-pink-500' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);

  useEffect(() => {
    const checkNewAnnouncements = () => {
      const lastCheck = localStorage.getItem('lastAnnouncementCheck');
      const announcements = localStorage.getItem('announcements');

      if (announcements) {
        const parsedAnnouncements = JSON.parse(announcements);
        if (parsedAnnouncements.length > 0) {
          const latestAnnouncement = parsedAnnouncements[0];
          if (!lastCheck || new Date(latestAnnouncement.createdAt) > new Date(lastCheck)) {
            setHasNewAnnouncement(true);
          }
        }
      }
    };

    checkNewAnnouncements();
    const interval = setInterval(checkNewAnnouncements, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-6 z-50">
      {/* Menu Items - apenas ícones circulares */}
      {menuItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => {
              if (item.path === '/avisos') {
                setHasNewAnnouncement(false);
                localStorage.setItem('lastAnnouncementCheck', new Date().toISOString());
              }
              router.push(item.path);
            }}
            className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:scale-110 ${isActive
              ? `${item.bgColor} text-white`
              : `${item.bgColor} text-white opacity-70 hover:opacity-100`
              }`}
            title={item.label}
          >
            <item.icon className="text-xl" />
            {item.path === '/avisos' && hasNewAnnouncement && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse font-bold">
                !
              </span>
            )}
          </button>
        );
      })}


    </div>
  );
}
