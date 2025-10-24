'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';
import { FaCreditCard, FaCalendarAlt, FaTasks, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAllNotifications } from '../../src/hooks/useAllNotifications';

export default function Notifications() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useAllNotifications();
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-transparent text-gray-900 dark:text-gray-100">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent">
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Configurações de Notificações</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Configure quando receber alertas e lembretes</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="paymentNotifications" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="paymentDays14" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quando vencer em menos de 14 dias
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paymentDays7"
                      checked={settings.paymentDays7}
                      onChange={(e) => handleSettingChange('paymentDays7', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="paymentDays7" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quando vencer em menos de 7 dias (padrão)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="eventNotifications" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="eventDays14" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quando for em menos de 14 dias
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="eventDays7"
                      checked={settings.eventDays7}
                      onChange={(e) => handleSettingChange('eventDays7', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="eventDays7" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quando for em menos de 7 dias (padrão)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
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
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="taskNotifications" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
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
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="taskDays14" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quando vencer em menos de 14 dias
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="taskDays7"
                      checked={settings.taskDays7}
                      onChange={(e) => handleSettingChange('taskDays7', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="taskDays7" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Quando vencer em menos de 7 dias (padrão)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Notificações */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Histórico de Notificações</h3>
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Marcar todas como lidas
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-2 text-gray-900 dark:text-gray-100">Status</th>
                    <th className="text-left py-2 text-gray-900 dark:text-gray-100">Tipo</th>
                    <th className="text-left py-2 text-gray-900 dark:text-gray-100">Título</th>
                    <th className="text-left py-2 text-gray-900 dark:text-gray-100">Mensagem</th>
                    <th className="text-left py-2 text-gray-900 dark:text-gray-100">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAll ? notifications : notifications.slice(0, 10)).map((notification) => {
                    const getTypeIcon = (type: string) => {
                      switch(type) {
                        case 'payment': return <FaCreditCard className="text-red-500" />;
                        case 'event': return <FaCalendarAlt className="text-blue-500" />;
                        case 'task': return <FaTasks className="text-orange-500" />;
                        default: return null;
                      }
                    };
                    
                    return (
                      <tr key={notification.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                        <td className="py-3">
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center"
                          >
                            {notification.read ? (
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
                          <span className={`${!notification.read ? 'font-semibold' : ''} text-gray-900 dark:text-gray-100`}>
                            {notification.title}
                          </span>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">
                          {notification.message}
                        </td>
                        <td className="py-3 text-gray-500 dark:text-gray-500 text-xs">
                          {new Date(notification.date).toLocaleDateString('pt-BR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {!showAll && notifications.length > 10 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
            
            {showAll && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setShowAll(false)}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Mostrar apenas as últimas 10
                </button>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {notifications.length} notificações
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}