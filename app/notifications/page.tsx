'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface NotificationSettings {
  payments: {
    enabled: boolean;
    days14: boolean;
    days7: boolean;
    days1: boolean;
  };
  events: {
    enabled: boolean;
    days14: boolean;
    days7: boolean;
    days1: boolean;
  };
  tasks: {
    enabled: boolean;
    days14: boolean;
    days7: boolean;
    days1: boolean;
    completed: boolean;
  };
}

export default function NotificationsSettings() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    payments: { enabled: true, days14: false, days7: true, days1: false },
    events: { enabled: true, days14: false, days7: true, days1: false },
    tasks: { enabled: true, days14: false, days7: true, days1: false, completed: true }
  });
  
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      loadSettings();
      fetchNotifications();
    }
  }, [isAuthenticated, loading, router]);

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

  const loadSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof NotificationSettings, field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const NotificationHistory = ({ theme }: { theme: any }) => {
    const displayedNotifications = showAll ? notifications : notifications.slice(0, 10);
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');

    return (
      <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${theme.text}`}>Histórico de Notificações</h2>
          {notifications.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={`flex items-center space-x-2 px-4 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg hover:${theme.hover} transition-colors`}
            >
              <span className={theme.textSecondary}>
                {showAll ? 'Ver menos' : `Ver todas (${notifications.length})`}
              </span>
              {showAll ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          )}
        </div>

        {loadingNotifications ? (
          <div className="text-center py-8">
            <div className={`${theme.textSecondary}`}>Carregando notificações...</div>
          </div>
        ) : displayedNotifications.length > 0 ? (
          <div className="space-y-3">
            {displayedNotifications.map((notification: any) => {
              const isRead = readNotifications.includes(notification.id.toString());
              return (
                <div
                  key={notification.id}
                  onClick={() => {
                    const savedRead = JSON.parse(localStorage.getItem('readNotifications') || '[]');
                    if (isRead) {
                      // Remove from read list
                      const updatedRead = savedRead.filter((id: string) => id !== notification.id.toString());
                      localStorage.setItem('readNotifications', JSON.stringify(updatedRead));
                    } else {
                      // Add to read list
                      const updatedRead = [...savedRead, notification.id.toString()];
                      localStorage.setItem('readNotifications', JSON.stringify(updatedRead));
                    }
                    // Refresh the component and sync with other pages
                    fetchNotifications();
                    window.dispatchEvent(new StorageEvent('storage', {
                      key: 'readNotifications',
                      newValue: localStorage.getItem('readNotifications')
                    }));
                    window.dispatchEvent(new Event('notificationsUpdated'));
                  }}
                  className={`p-4 border rounded-lg transition-all cursor-pointer hover:shadow-md ${
                    isRead ? `${theme.border} ${theme.secondaryBg}` : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      isRead ? 'bg-gray-400' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className={`font-semibold ${theme.text}`}>{notification.title}</h4>
                        {!isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            NOVA
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${theme.textSecondary} mb-2`}>{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'ALERT' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                          notification.type === 'PAYMENT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          notification.type === 'EVENT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.type === 'ALERT' ? 'Alerta' :
                           notification.type === 'PAYMENT' ? 'Pagamento' :
                           notification.type === 'EVENT' ? 'Evento' : 'Geral'}
                        </span>
                        <span className={`text-xs ${theme.textSecondary}`}>
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔔</div>
            <p className={`${theme.textSecondary}`}>Nenhuma notificação encontrada</p>
          </div>
        )}
      </div>
    );
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
            <h1 className={`text-3xl font-bold ${theme.text}`}>Notificações</h1>
            <p className={`${theme.textSecondary} mt-2`}>Histórico e configurações de notificações</p>
          </div>

          <div className="max-w-4xl">
            {/* Histórico de Notificações */}
            <NotificationHistory theme={theme} />

            <div className="mb-8">
              <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Configurações</h2>
            </div>
            {/* Notificações de Pagamentos */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 mb-6`}>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <h3 className={`text-lg font-semibold ${theme.text}`}>Notificações de Pagamentos</h3>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payments.enabled}
                    onChange={(e) => updateSetting('payments', 'enabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`font-medium ${theme.text}`}>Receber notificações de pagamentos pendentes</span>
                </label>
                
                <div className={`ml-8 space-y-3 ${!settings.payments.enabled ? 'opacity-50' : ''}`}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.payments.days14}
                      onChange={(e) => updateSetting('payments', 'days14', e.target.checked)}
                      disabled={!settings.payments.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando vencer em menos de 14 dias</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.payments.days7}
                      onChange={(e) => updateSetting('payments', 'days7', e.target.checked)}
                      disabled={!settings.payments.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando vencer em menos de 7 dias (padrão)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.payments.days1}
                      onChange={(e) => updateSetting('payments', 'days1', e.target.checked)}
                      disabled={!settings.payments.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando vencer em 1 dia</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notificações de Eventos */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 mb-6`}>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <h3 className={`text-lg font-semibold ${theme.text}`}>Notificações de Eventos</h3>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.events.enabled}
                    onChange={(e) => updateSetting('events', 'enabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`font-medium ${theme.text}`}>Receber notificações de eventos próximos</span>
                </label>
                
                <div className={`ml-8 space-y-3 ${!settings.events.enabled ? 'opacity-50' : ''}`}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.events.days14}
                      onChange={(e) => updateSetting('events', 'days14', e.target.checked)}
                      disabled={!settings.events.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando for em menos de 14 dias</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.events.days7}
                      onChange={(e) => updateSetting('events', 'days7', e.target.checked)}
                      disabled={!settings.events.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando for em menos de 7 dias (padrão)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.events.days1}
                      onChange={(e) => updateSetting('events', 'days1', e.target.checked)}
                      disabled={!settings.events.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando for em 1 dia</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Notificações de Tarefas */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 mb-6`}>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <h3 className={`text-lg font-semibold ${theme.text}`}>Notificações de Tarefas</h3>
              </div>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.tasks.enabled}
                    onChange={(e) => updateSetting('tasks', 'enabled', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`font-medium ${theme.text}`}>Receber notificações de tarefas pendentes</span>
                </label>
                
                <div className={`ml-8 space-y-3 ${!settings.tasks.enabled ? 'opacity-50' : ''}`}>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tasks.days14}
                      onChange={(e) => updateSetting('tasks', 'days14', e.target.checked)}
                      disabled={!settings.tasks.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando vencer em menos de 14 dias</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tasks.days7}
                      onChange={(e) => updateSetting('tasks', 'days7', e.target.checked)}
                      disabled={!settings.tasks.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando vencer em menos de 7 dias (padrão)</span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tasks.days1}
                      onChange={(e) => updateSetting('tasks', 'days1', e.target.checked)}
                      disabled={!settings.tasks.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={theme.textSecondary}>Quando vencer em 1 dia</span>
                  </label>
                  
                  <div className={`border-t ${theme.border} pt-3 mt-3`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.tasks.completed}
                        onChange={(e) => updateSetting('tasks', 'completed', e.target.checked)}
                        disabled={!settings.tasks.enabled}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className={theme.textSecondary}>Quando uma tarefa for concluída (apenas ADM)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    </div>
  );
}