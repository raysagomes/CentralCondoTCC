'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { useStats } from '../../src/hooks/useStats';
import { HiSpeakerphone } from 'react-icons/hi';
import { IoNotifications } from 'react-icons/io5';
import { getSelectedModulesClient } from '@/lib/modules';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const { pendingTasks, loading: dashboardLoading } = useDashboard();
  const { stats } = useStats();

  const [dashboardNotifications, setDashboardNotifications] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [readAnnouncements, setReadAnnouncements] = useState<string[]>([]);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);

  // 🔹 Carrega módulos ativos
  useEffect(() => {
    const modules = getSelectedModulesClient();
    setActiveModules(modules);
  }, []);

  // 🔄 Redefinir módulos (sem alert)
  const handleResetModules = () => {
    const email = localStorage.getItem('userEmail');
    const key = email ? `modules_${email}` : 'modules';
    localStorage.removeItem(key);
    router.replace('/setup-modules');
  };

  // 🔹 Carrega avisos
  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('/api/announcements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const latest = data.announcements.slice(0, 3);
        setAnnouncements(latest);
        const saved = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
        setReadAnnouncements(saved);
        setHasNewAnnouncement(latest.some((a: any) => !saved.includes(a.id.toString())));
      }
    } catch (err) {
      console.error('Erro ao carregar avisos:', err);
    }
  };

  const markAnnouncementAsRead = (id: string) => {
    const updated = [...readAnnouncements, id];
    setReadAnnouncements(updated);
    localStorage.setItem('readAnnouncements', JSON.stringify(updated));
    setHasNewAnnouncement(announcements.some((a) => !updated.includes(a.id.toString())));
  };

  // 🔹 Carrega notificações
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardNotifications(data);
        const saved = JSON.parse(localStorage.getItem('readNotifications') || '[]');
        setReadNotifications(saved);
        const hasUnread = data.some((n: any) => !saved.includes(n.id.toString()));
        setHasNewNotification(hasUnread);
        if (hasUnread) {
          setShowNotificationToast(true);
          setTimeout(() => setShowNotificationToast(false), 4000);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  // 🔹 Carrega eventos
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const future = data
          .filter((e: any) => new Date(e.date) >= now)
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setRecentEvents(future);
      }
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth');
    if (isAuthenticated) {
      fetchEvents();
      loadAnnouncements();
      loadNotifications();
    }
  }, [isAuthenticated, loading]);

  if (loading || dashboardLoading || eventsLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
          {/* Cabeçalho da Dashboard */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard</h1>
              <p className={`${theme.textSecondary} mt-2`}>
                Bem-vindo, {user?.name}!
              </p>
            </div>
            <button
              onClick={handleResetModules}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Redefinir módulos
            </button>
          </div>

          {/* 🔔 Mural de Avisos */}
          <div
            className={`${theme.cardBg} border ${theme.border} p-8 rounded-xl hover:border-orange-500/50 transition-all duration-200 cursor-pointer mb-8`}
            onClick={() => router.push('/avisos')}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-2xl font-bold ${theme.text} flex items-center`}>
                <span
                  className={`w-3 h-3 rounded-full mr-4 ${
                    hasNewAnnouncement ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                  }`}
                ></span>
                Mural de Avisos
              </h3>
              <span className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Ver mais →
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((a: any) => (
                <div
                  key={a.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    markAnnouncementAsRead(a.id.toString());
                  }}
                  className={`${theme.secondaryBg} border p-4 rounded-lg ${
                    !readAnnouncements.includes(a.id.toString())
                      ? 'border-red-500 shadow-red-500/50 shadow-lg animate-pulse'
                      : `${theme.border} hover:border-orange-500/30`
                  }`}
                >
                  <h4 className={`font-semibold ${theme.text} text-sm mb-2`}>
                    {a.title}
                  </h4>
                  <p className={`text-xs ${theme.textSecondary}`}>{a.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 📅 Eventos */}
          {activeModules.includes('calendario') && (
            <div
              className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-blue-500/50 transition-all duration-200 mb-8`}
            >
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                📅 Próximos Eventos
              </h3>
              {recentEvents.length > 0 ? (
                <ul className="space-y-3">
                  {recentEvents.slice(0, 3).map((event) => (
                    <li key={event.id} className={`p-3 ${theme.secondaryBg} rounded-lg`}>
                      <p className={`${theme.text}`}>{event.title}</p>
                      <p className={`${theme.textSecondary} text-xs`}>
                        {new Date(event.date).toLocaleDateString('pt-BR')}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`${theme.textSecondary}`}>Nenhum evento próximo</p>
              )}
            </div>
          )}

          {/* 📋 Projetos / Tarefas */}
          {activeModules.includes('projetos') && (
            <div
              className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-yellow-500/50 transition-all duration-200 mb-8`}
            >
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                📋 Tarefas Pendentes
              </h3>
              {pendingTasks.length > 0 ? (
                <ul className="space-y-3">
                  {pendingTasks.slice(0, 3).map((t) => (
                    <li key={t.id} className={`p-3 ${theme.secondaryBg} rounded-lg`}>
                      <p className={`${theme.text}`}>{t.title}</p>
                      <p className={`${theme.textSecondary} text-xs`}>
                        {t.project?.name}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`${theme.textSecondary}`}>Nenhuma tarefa pendente</p>
              )}
            </div>
          )}

          {/* 💰 Pagamentos */}
          {activeModules.includes('pagamento') && (
            <div
              className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-green-500/50 transition-all duration-200`}
            >
              <h3 className={`text-lg font-semibold ${theme.text} mb-6`}>
                💰 Pagamentos
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500 mb-2">
                  {stats.paymentsCount}
                </div>
                <div className={`${theme.textSecondary}`}>
                  Total de pagamentos registrados
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
