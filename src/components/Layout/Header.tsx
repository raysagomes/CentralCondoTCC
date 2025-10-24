'use client';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { getThemeClasses } from '../../utils/themeClasses';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setNotificationCount(data.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      // Mock data se API não existir
      const mockNotifications = [
        { id: 1, title: 'Nova tarefa atribuída', message: 'Você foi atribuído à tarefa "Revisar documentos"', read: false, createdAt: new Date().toISOString() },
        { id: 2, title: 'Evento próximo', message: 'Reunião de equipe em 1 hora', read: false, createdAt: new Date().toISOString() },
        { id: 3, title: 'Pagamento vencido', message: 'Boleto de condomínio vence hoje', read: true, createdAt: new Date().toISOString() }
      ];
      setNotifications(mockNotifications);
      setNotificationCount(mockNotifications.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`fixed top-0 left-20 right-0 ${theme.cardBg} border-b ${theme.border} z-40`}>
      <div className="px-6 py-4">
        <div className="flex justify-end items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`w-10 h-10 ${theme.secondaryBg} border ${theme.border} rounded-xl flex items-center justify-center ${theme.hover} transition-all duration-200`}
            >
              <FaUser className={theme.textSecondary} />
            </button>
            
            {showProfileDropdown && (
              <div className={`absolute right-0 mt-2 w-48 ${theme.secondaryBg} border ${theme.border} rounded-xl shadow-xl`}>
                <div className={`p-3 border-b ${theme.border}`}>
                  <p className={`font-medium ${theme.text}`}>{user?.name}</p>
                  <p className={`text-sm ${theme.textSecondary}`}>{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowProfileDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm ${theme.textSecondary} hover:${theme.text} ${theme.hover} transition-colors`}
                >
                  Ver Perfil
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-10 h-10 ${theme.secondaryBg} border ${theme.border} rounded-xl flex items-center justify-center ${theme.hover} transition-all duration-200`}
            >
              <FaBell className={theme.textSecondary} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 ${theme.secondaryBg} border ${theme.border} rounded-xl shadow-xl z-50`}>
                <div className={`p-4 border-b ${theme.border}`}>
                  <h3 className={`font-semibold ${theme.text}`}>Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className={`p-4 border-b ${theme.border} last:border-b-0 ${theme.hover} transition-colors`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.read ? 'bg-gray-400' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${theme.text}`}>{notification.title}</p>
                            <p className={`text-xs ${theme.textSecondary} mt-1`}>{notification.message}</p>
                            <p className={`text-xs ${theme.textSecondary} mt-1`}>
                              {new Date(notification.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FaBell className={`mx-auto text-2xl ${theme.textSecondary} mb-2`} />
                      <p className={`text-sm ${theme.textSecondary}`}>Nenhuma notificação</p>
                    </div>
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className={`p-3 border-t ${theme.border} text-center`}>
                    <button className={`text-sm text-blue-500 hover:text-blue-400 transition-colors`}>
                      Ver todas as notificações
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`w-10 h-10 ${theme.secondaryBg} border ${theme.border} rounded-xl flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200 group`}
            title="Sair"
          >
            <FaSignOutAlt className={`${theme.textSecondary} group-hover:text-red-400`} />
          </button>
        </div>
      </div>
    </header>
  );
}