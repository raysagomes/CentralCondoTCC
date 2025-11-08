'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { useStats } from '../../src/hooks/useStats';
import { useState } from 'react';
import { HiSpeakerphone } from 'react-icons/hi';
import { IoNotifications } from 'react-icons/io5';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const { pendingTasks, loading: dashboardLoading } = useDashboard();
  const [dashboardNotifications, setDashboardNotifications] = useState<any[]>([]);
  const { stats } = useStats();
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastAnnouncementCount, setLastAnnouncementCount] = useState(0);
  const [readAnnouncements, setReadAnnouncements] = useState<string[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'GENERAL', recipients: 'all' });
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  const loadAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const latestAnnouncements = data.announcements.slice(0, 3); // Apenas os 3 últimos
        setAnnouncements(latestAnnouncements);
        
        const savedRead = localStorage.getItem('readAnnouncements');
        const parsedRead = savedRead ? JSON.parse(savedRead) : [];
        setReadAnnouncements(parsedRead);
        
        const hasUnread = latestAnnouncements.some((ann: any) => !parsedRead.includes(ann.id.toString()));
        setHasNewAnnouncement(hasUnread);
      }
    } catch (error) {
      console.error('Erro ao carregar avisos:', error);
    }
  };

  const markAnnouncementAsRead = (announcementId: string) => {
    const updatedRead = [...readAnnouncements, announcementId];
    setReadAnnouncements(updatedRead);
    localStorage.setItem('readAnnouncements', JSON.stringify(updatedRead));
    
    // Verifica se ainda há avisos não lidos
    const hasUnread = announcements.some((ann: any) => !updatedRead.includes(ann.id.toString()));
    setHasNewAnnouncement(hasUnread);
  };

  const checkPaymentNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const paymentsResponse = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (paymentsResponse.ok) {
        const payments = await paymentsResponse.json();
        const now = new Date();
        
        for (const payment of payments) {
          if (!payment.paid) {
            const dueDate = new Date(payment.dueDate);
            const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue <= 7 && daysUntilDue >= 0) {
              // Verificar se já existe notificação recente para este pagamento
              const existingNotifications = dashboardNotifications.filter(n => 
                n.type === 'PAYMENT' && n.message.includes(payment.title)
              );
              
              if (existingNotifications.length === 0) {
                // Criar notificação
                await fetch('/api/notifications', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    title: 'Pagamento Próximo do Vencimento',
                    message: `O pagamento "${payment.title}" vence em ${daysUntilDue} dia(s)`,
                    type: 'PAYMENT'
                  })
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar pagamentos:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardNotifications(data);
        const savedRead = localStorage.getItem('readNotifications');
        const parsedRead = savedRead ? JSON.parse(savedRead) : [];
        
        const hasUnread = data.some((notif: any) => !parsedRead.includes(notif.id.toString()));
        
        if (data.length > lastNotificationCount && lastNotificationCount > 0) {
          setHasNewNotification(hasUnread);
          if (hasUnread) {
            setShowNotificationToast(true);
            setTimeout(() => setShowNotificationToast(false), 5000);
          }
        } else {
          setHasNewNotification(hasUnread);
        }
        
        setReadNotifications(parsedRead);
        setLastNotificationCount(data.length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedRead = [...readNotifications, notificationId];
    setReadNotifications(updatedRead);
    localStorage.setItem('readNotifications', JSON.stringify(updatedRead));
    
    // Verifica se ainda há notificações não lidas
    const hasUnread = dashboardNotifications.some((notif: any) => !updatedRead.includes(notif.id.toString()));
    setHasNewNotification(hasUnread);
  };


  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const now = new Date();
        const futureEvents = data
          .filter((event: any) => {
            if (!event.date) return false;
            const eventDate = new Date(event.date);
            if (isNaN(eventDate.getTime())) return false;
            const [hours, minutes] = (event.time || '00:00').split(':');
            eventDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return eventDate >= now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
            
            const [hoursA, minutesA] = (a.time || '00:00').split(':');
            dateA.setHours(parseInt(hoursA), parseInt(minutesA), 0, 0);
            
            const [hoursB, minutesB] = (b.time || '00:00').split(':');
            dateB.setHours(parseInt(hoursB), parseInt(minutesB), 0, 0);
            
            return dateA.getTime() - dateB.getTime();
          });
        setRecentEvents(futureEvents);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.filter((m: any) => m.accountType === 'USER'));
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      fetchEvents();
      loadAnnouncements();
      loadNotifications();
      const interval = setInterval(() => {
        fetchEvents();
        loadNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchEvents();
      }
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (isAuthenticated && e.key === 'readNotifications') {
        loadNotifications();
      }
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        fetchEvents();
        loadAnnouncements();
        loadNotifications();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (showNotificationModal) {
      fetchMembers();
    }
  }, [showNotificationModal]);

  if (loading || dashboardLoading || eventsLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${theme.text}`}>Dashboard</h1>
              <p className={`${theme.textSecondary} mt-2`}>Bem-vindo, {user?.name}!</p>
            </div>
          </div>
        </div>

        {/* Card de Avisos - Largura Total */}
        <div className={`${theme.cardBg} border ${theme.border} p-8 rounded-xl hover:border-orange-500/50 transition-all duration-200 cursor-pointer mb-8`}
             onClick={() => {
               setHasNewAnnouncement(false);
               router.push('/avisos');
             }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-bold ${theme.text} flex items-center`}>
              <span className={`w-3 h-3 rounded-full mr-4 ${
                hasNewAnnouncement ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
              }`}></span>
              Mural de Avisos
            </h3>
            <span className="text-sm text-orange-500 hover:text-orange-600 font-medium">Ver mais →</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement: any) => {
              const isNew = new Date(announcement.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000); // Novo se criado nas últimas 24h
              const isUnread = !readAnnouncements.includes(announcement.id.toString());
              return (
              <div key={announcement.id} 
                   onClick={(e) => {
                     e.stopPropagation();
                     markAnnouncementAsRead(announcement.id.toString());
                   }}
                   className={`${theme.secondaryBg} border p-4 rounded-lg transition-all duration-200 cursor-pointer ${
                isNew && isUnread
                  ? 'border-red-500 shadow-red-500/50 shadow-lg animate-pulse bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' 
                  : `${theme.border} hover:border-orange-500/30`
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-semibold ${theme.text} text-sm`}>{announcement.title}</h4>
                    {isNew && isUnread && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce font-bold">
                        NOVO!
                      </span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    announcement.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    announcement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.priority === 'HIGH' ? 'Alta' :
                     announcement.priority === 'MEDIUM' ? 'Média' : 'Normal'}
                  </span>
                </div>
                <p className={`text-xs ${theme.textSecondary} mb-3 line-clamp-3`}>{announcement.content}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className={theme.textSecondary}>
                    {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={theme.textSecondary}>
                    Por: {announcement.author?.name || 'Sistema'}
                  </span>
                </div>
              </div>
            );
            })}
            {announcements.length === 0 && (
              <div className={`col-span-full text-center py-12 ${theme.textSecondary}`}>
                <HiSpeakerphone className="text-5xl mb-4 mx-auto" />
                <p className="text-lg">Nenhum aviso no momento</p>
              </div>
            )}
          </div>
        </div>

        {/* Cards Menores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-blue-500/50 transition-all duration-200`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text} flex items-center`}>
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Próximos Eventos
              </h3>
              <button
                onClick={() => router.push('/calendar')}
                className="text-blue-500 hover:text-blue-400 text-sm font-medium"
              >
                Ver mais →
              </button>
            </div>
            <div className="space-y-3">
              {recentEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className={`flex items-center space-x-3 p-3 ${theme.secondaryBg} rounded-lg ${theme.hover} transition`}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme.text} truncate`}>{event.title}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>
                      {event.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'Data não definida'}
                    </p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className={`text-sm ${theme.textSecondary} text-center py-4`}>Nenhum evento próximo</p>
              )}
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-yellow-500/50 transition-all duration-200`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text} flex items-center`}>
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
                Minhas Tarefas
              </h3>
              <button
                onClick={() => router.push('/tasks')}
                className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
              >
                Ver todas →
              </button>
            </div>
            <div className="space-y-3">
              {pendingTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} 
                     onClick={() => {
                       // Navegar para projetos e selecionar o projeto da tarefa
                       router.push(`/projects?projectId=${task.project.id}&taskId=${task.id}`);
                     }}
                     className={`flex items-center space-x-3 p-3 ${theme.secondaryBg} rounded-lg ${theme.hover} transition cursor-pointer`}>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme.text} truncate`}>{task.title}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{task.project.name}</p>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className={`text-sm ${theme.textSecondary} text-center py-4`}>Nenhuma tarefa atribuída</p>
              )}
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-red-500/50 transition-all duration-200`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text} flex items-center`}>
                <span className={`w-2 h-2 rounded-full mr-3 ${
                  hasNewNotification ? 'bg-red-500 animate-pulse' : 'bg-red-500'
                }`}></span>
                Notificações
              </h3>
              <button
                onClick={() => router.push('/notifications')}
                className="text-red-500 hover:text-red-400 text-sm font-medium"
              >
                Ver mais →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardNotifications
                .filter((notification: any) => !readNotifications.includes(notification.id.toString()))
                .slice(0, 3)
                .map((notification: any) => {
                const isNew = new Date(notification.createdAt || Date.now()) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                const isUnread = !readNotifications.includes(notification.id.toString());
                return (
                <div key={notification.id} 
                     onClick={async () => {
                       try {
                         const token = localStorage.getItem('token');
                         await fetch('/api/notifications', {
                           method: 'PATCH',
                           headers: {
                             'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`
                           },
                           body: JSON.stringify({ notificationId: notification.id })
                         });
                         markNotificationAsRead(notification.id.toString());
                       } catch (error) {
                         console.error('Erro ao marcar notificação como lida:', error);
                       }
                     }}
                     className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isNew && isUnread
                    ? 'border border-red-500 shadow-red-500/50 shadow-lg animate-pulse bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20' 
                    : `${theme.secondaryBg} ${theme.hover}`
                }`}>
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                    isNew && isUnread ? 'bg-red-500 animate-pulse' : 'bg-red-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className={`text-sm font-medium text-red-600`}>{notification.title}</p>
                      {isNew && isUnread && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce font-bold">
                          NOVA!
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${theme.textSecondary}`}>{notification.message}</p>
                  </div>
                </div>
              );
              })}
              {dashboardNotifications.filter((notification: any) => !readNotifications.includes(notification.id.toString())).length === 0 && (
                <p className={`text-sm ${theme.textSecondary} text-center py-4`}>Nenhuma notificação</p>
              )}
            </div>
          </div>
        </div>

        <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl`}>
          <h3 className={`text-lg font-semibold ${theme.text} mb-6`}>Resumo Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`text-center p-6 ${theme.secondaryBg} rounded-lg border ${theme.border} hover:border-blue-500/50 transition-all duration-200`}>
              <div className="text-4xl font-bold text-blue-500 mb-2">{recentEvents.length}</div>
              <div className={`text-sm ${theme.textSecondary}`}>Eventos Próximos</div>
            </div>
            <div className={`text-center p-6 ${theme.secondaryBg} rounded-lg border ${theme.border} hover:border-yellow-500/50 transition-all duration-200`}>
              <div className="text-4xl font-bold text-yellow-500 mb-2">{pendingTasks.length}</div>
              <div className={`text-sm ${theme.textSecondary}`}>Tarefas Pendentes</div>
            </div>
            <div className={`text-center p-6 ${theme.secondaryBg} rounded-lg border ${theme.border} hover:border-orange-500/50 transition-all duration-200`}>
              <div className="text-4xl font-bold text-orange-500 mb-2">{announcements.length}</div>
              <div className={`text-sm ${theme.textSecondary}`}>Avisos</div>
            </div>
            <div className={`text-center p-6 ${theme.secondaryBg} rounded-lg border ${theme.border} hover:border-green-500/50 transition-all duration-200`}>
              <div className="text-4xl font-bold text-green-500 mb-2">{stats.paymentsCount}</div>
              <div className={`text-sm ${theme.textSecondary}`}>Pagamentos</div>
            </div>
          </div>
        </div>



        {/* Toast de Novo Aviso */}
        {showToast && (
          <div className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="text-xl">!!!</span>
              <span className="font-semibold">Novo aviso publicado!</span>
              <span className="text-xl">!!!</span>
            </div>
          </div>
        )}

        {/* Toast de Nova Notificação */}
        {showNotificationToast && (
          <div className="fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center space-x-2">
              <IoNotifications className="text-xl" />
              <span className="font-semibold">Nova notificação recebida!</span>
              <IoNotifications className="text-xl" />
            </div>
          </div>
        )}

        </div>
      </AppLayout>
    </div>
  );
}