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

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const { pendingTasks, notifications, loading: dashboardLoading } = useDashboard();
  const { stats } = useStats();
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'GENERAL', recipients: 'all' });
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const sortedEvents = data.sort((a: any, b: any) => 
          new Date(a.date + ' ' + (a.time || '00:00')).getTime() - 
          new Date(b.date + ' ' + (b.time || '00:00')).getTime()
        );
        setRecentEvents(sortedEvents);
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

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newNotification,
          selectedMembers: newNotification.recipients === 'specific' ? selectedMembers : []
        })
      });

      if (response.ok) {
        setShowNotificationModal(false);
        setNewNotification({ title: '', message: '', type: 'GENERAL', recipients: 'all' });
        setSelectedMembers([]);
        alert('Notificação enviada com sucesso!');
      } else {
        alert('Erro ao enviar notificação');
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      alert('Erro ao enviar notificação');
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      fetchEvents();
      const interval = setInterval(fetchEvents, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchEvents();
      }
    };
    
    const handleStorageChange = () => {
      if (isAuthenticated) {
        fetchEvents();
      }
    };
    
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        fetchEvents();
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
            {user?.accountType === 'COMPANY' && (
              <button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Notificação
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-blue-500/50 transition-all duration-200`}>
            <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}>
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Próximos Eventos
            </h3>
            <div className="space-y-3">
              {recentEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className={`flex items-center space-x-3 p-3 ${theme.secondaryBg} rounded-lg ${theme.hover} transition`}>
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme.text} truncate`}>{event.title}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{new Date(event.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className={`text-sm ${theme.textSecondary} text-center py-4`}>Nenhum evento próximo</p>
              )}
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-yellow-500/50 transition-all duration-200`}>
            <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}>
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              Tarefas Pendentes
            </h3>
            <div className="space-y-3">
              {pendingTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className={`flex items-center space-x-3 p-3 ${theme.secondaryBg} rounded-lg ${theme.hover} transition`}>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme.text} truncate`}>{task.title}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{task.project.name}</p>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className={`text-sm ${theme.textSecondary} text-center py-4`}>Nenhuma tarefa pendente</p>
              )}
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-red-500/50 transition-all duration-200`}>
            <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}>
              <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
              Notificações
            </h3>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification: any) => (
                <div key={notification.id} className={`flex items-start space-x-3 p-3 ${theme.secondaryBg} rounded-lg ${theme.hover} transition`}>
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-1 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme.text}`}>{notification.title}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>{notification.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
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
            <div className={`text-center p-6 ${theme.secondaryBg} rounded-lg border ${theme.border} hover:border-red-500/50 transition-all duration-200`}>
              <div className="text-4xl font-bold text-red-500 mb-2">{notifications.length}</div>
              <div className={`text-sm ${theme.textSecondary}`}>Notificações</div>
            </div>
            <div className={`text-center p-6 ${theme.secondaryBg} rounded-lg border ${theme.border} hover:border-green-500/50 transition-all duration-200`}>
              <div className="text-4xl font-bold text-green-500 mb-2">{stats.paymentsCount}</div>
              <div className={`text-sm ${theme.textSecondary}`}>Pagamentos</div>
            </div>
          </div>
        </div>

        {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Enviar Notificação</h3>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Título</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Mensagem</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Tipo</label>
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="GENERAL">Geral</option>
                    <option value="ALERT">Alerta</option>
                    <option value="PAYMENT">Pagamento</option>
                    <option value="EVENT">Evento</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Destinatários</label>
                  <select
                    value={newNotification.recipients}
                    onChange={(e) => {
                      setNewNotification({...newNotification, recipients: e.target.value});
                      if (e.target.value === 'all') setSelectedMembers([]);
                      else if (e.target.value === 'specific') fetchMembers();
                    }}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="all">Todos os membros</option>
                    <option value="specific">Membros específicos</option>
                  </select>
                </div>
                {newNotification.recipients === 'specific' && (
                  <div>
                    <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Selecionar Membros</label>
                    <div className={`max-h-32 overflow-y-auto border ${theme.border} rounded-lg p-2 ${theme.secondaryBg}`}>
                      {members.map((member) => (
                        <label key={member.id} className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembers([...selectedMembers, member.id]);
                              } else {
                                setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                              }
                            }}
                            className="rounded"
                          />
                          <span className={`text-sm ${theme.text}`}>{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowNotificationModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </AppLayout>
    </div>
  );
}