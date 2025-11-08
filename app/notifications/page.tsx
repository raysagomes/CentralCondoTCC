'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { FaCreditCard, FaCalendarAlt, FaTasks, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoNotifications } from 'react-icons/io5';

export default function Notifications() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [settings, setSettings] = useState({
    paymentNotifications: true,
    paymentDays14: false,
    paymentDays7: true,
    eventNotifications: true,
    eventDays14: false,
    eventDays7: true,
    taskNotifications: true,
    taskDays14: false,
    taskDays7: true
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'READ' } 
            : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const unreadNotifications = notifications.filter(n => n.status !== 'READ');
      
      await Promise.all(
        unreadNotifications.map(notif => 
          fetch('/api/notifications', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ notificationId: notif.id })
          })
        )
      );
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, status: 'READ' }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleSettingChange = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    
    // Salvar no banco de dados (implementar se necessário)
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  if (loading) {
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
            <h1 className={`text-3xl font-bold ${theme.text}`}>Configurações de Notificações</h1>
            <p className={`${theme.textSecondary} mt-2`}>Configure quando receber alertas e lembretes</p>
          </div>

          <div className="max-w-4xl space-y-6">
            {/* Configurações de Pagamentos */}
            <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}>
                <FaCreditCard className="text-red-500 mr-2" />
                Notificações de Pagamentos
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paymentNotifications"
                    checked={settings.paymentNotifications}
                    onChange={(e) => handleSettingChange('paymentNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="paymentNotifications" className={`ml-2 text-sm font-medium ${theme.text}`}>
                    Receber notificações de pagamentos pendentes
                  </label>
                </div>

                {settings.paymentNotifications && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="paymentDays14"
                        checked={settings.paymentDays14}
                        onChange={(e) => handleSettingChange('paymentDays14', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="paymentDays14" className={`ml-2 text-sm ${theme.textSecondary}`}>
                        Quando vencer em menos de 14 dias
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="paymentDays7"
                        checked={settings.paymentDays7}
                        onChange={(e) => handleSettingChange('paymentDays7', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="paymentDays7" className={`ml-2 text-sm ${theme.textSecondary}`}>
                        Quando vencer em menos de 7 dias (padrão)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configurações de Eventos */}
            <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}>
                <FaCalendarAlt className="text-blue-500 mr-2" />
                Notificações de Eventos
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="eventNotifications"
                    checked={settings.eventNotifications}
                    onChange={(e) => handleSettingChange('eventNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="eventNotifications" className={`ml-2 text-sm font-medium ${theme.text}`}>
                    Receber notificações de eventos próximos
                  </label>
                </div>

                {settings.eventNotifications && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="eventDays14"
                        checked={settings.eventDays14}
                        onChange={(e) => handleSettingChange('eventDays14', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="eventDays14" className={`ml-2 text-sm ${theme.textSecondary}`}>
                        Quando for em menos de 14 dias
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="eventDays7"
                        checked={settings.eventDays7}
                        onChange={(e) => handleSettingChange('eventDays7', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="eventDays7" className={`ml-2 text-sm ${theme.textSecondary}`}>
                        Quando for em menos de 7 dias (padrão)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configurações de Tarefas */}
            <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center`}>
                <FaTasks className="text-orange-500 mr-2" />
                Notificações de Tarefas
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="taskNotifications"
                    checked={settings.taskNotifications}
                    onChange={(e) => handleSettingChange('taskNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="taskNotifications" className={`ml-2 text-sm font-medium ${theme.text}`}>
                    Receber notificações de tarefas pendentes
                  </label>
                </div>

                {settings.taskNotifications && (
                  <div className="ml-6 space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="taskDays14"
                        checked={settings.taskDays14}
                        onChange={(e) => handleSettingChange('taskDays14', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="taskDays14" className={`ml-2 text-sm ${theme.textSecondary}`}>
                        Quando vencer em menos de 14 dias
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="taskDays7"
                        checked={settings.taskDays7}
                        onChange={(e) => handleSettingChange('taskDays7', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="taskDays7" className={`ml-2 text-sm ${theme.textSecondary}`}>
                        Quando vencer em menos de 7 dias (padrão)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Histórico de Notificações */}
          <div className="max-w-6xl mt-8">
            <div className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${theme.text}`}>Histórico de Notificações</h3>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Marcar todas como lidas
                </button>
              </div>
              
              {loadingNotifications ? (
                <div className="text-center py-8">
                  <div className={`${theme.textSecondary}`}>Carregando notificações...</div>
                </div>
              ) : notifications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${theme.border}`}>
                        <th className={`text-left py-2 ${theme.text}`}>Status</th>
                        <th className={`text-left py-2 ${theme.text}`}>Tipo</th>
                        <th className={`text-left py-2 ${theme.text}`}>Título</th>
                        <th className={`text-left py-2 ${theme.text}`}>Mensagem</th>
                        <th className={`text-left py-2 ${theme.text}`}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAll ? notifications : notifications.slice(0, 10)).map((notification) => {
                        const getTypeIcon = (type: string) => {
                          switch(type) {
                            case 'PAYMENT': return <FaCreditCard className="text-red-500" />;
                            case 'EVENT': return <FaCalendarAlt className="text-blue-500" />;
                            case 'ALERT': return <FaTasks className="text-orange-500" />;
                            default: return <IoNotifications className="text-gray-500" />;
                          }
                        };
                        
                        return (
                          <tr key={notification.id} className={`border-b ${theme.border} hover:${theme.hover}`}>
                            <td className="py-3">
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center"
                              >
                                {notification.status === 'READ' ? (
                                  <FaEyeSlash className="text-gray-400" />
                                ) : (
                                  <FaEye className="text-blue-500" />
                                )}
                              </button>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center">
                                {getTypeIcon(notification.type)}
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`${notification.status !== 'READ' ? 'font-semibold' : ''} ${theme.text}`}>
                                {notification.title}
                              </span>
                            </td>
                            <td className={`py-3 ${theme.textSecondary}`}>
                              {notification.message}
                            </td>
                            <td className={`py-3 ${theme.textSecondary} text-xs`}>
                              {new Date(notification.createdAt).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })} às {new Date(notification.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <IoNotifications className={`text-4xl mb-4 mx-auto ${theme.textSecondary}`} />
                  <p className={`${theme.textSecondary}`}>Nenhuma notificação encontrada</p>
                </div>
              )}
              
              {!showAll && notifications.length > 10 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver todas as notificações
                  </button>
                </div>
              )}
              
              {showAll && (
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setShowAll(false)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Mostrar apenas as últimas 10
                  </button>
                  <div className={`text-sm ${theme.textSecondary}`}>
                    Total: {notifications.length} notificações
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}