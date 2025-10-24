'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';
import { useDashboard } from '../../src/hooks/useDashboard';
import { useNotifications } from '../../src/hooks/useNotifications';
import { FaBell } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const { recentEvents, pendingTasks, notifications: dashboardNotifications, loading: dashboardLoading } = useDashboard();
  const { notifications: alertNotifications } = useNotifications();
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchPendingPayments = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('/api/payments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const payments = await response.json();
            const pending = payments.filter((p: any) => !p.paid).length;
            setPendingPayments(pending);
          }
        } catch (error) {
          console.error('Erro ao buscar pagamentos:', error);
        }
      }
    };
    
    if (isAuthenticated) {
      fetchPendingPayments();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  if (loading || dashboardLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Bem-vindo, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {recentEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(event.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum evento próximo</p>
              )}
            </div>
          </div>

          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Tarefas Pendentes</h3>
            <div className="space-y-3">
              {pendingTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{task.project.name}</p>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma tarefa pendente</p>
              )}
            </div>
          </div>

          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notificações</h3>
            <div className="space-y-3">
              {dashboardNotifications.slice(0, 3).map((notification: any) => (
                <div key={notification.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                  </div>
                </div>
              ))}
              {dashboardNotifications.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma notificação</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Resumo Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recentEvents.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Eventos Próximos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Tarefas Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{dashboardNotifications.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Notificações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{pendingPayments}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pagamentos Pendentes</div>
            </div>
          </div>
        </div>

        {/* Seção de Alertas */}
        {alertNotifications.length > 0 && (
          <div className="bg-white/90 dark:bg-black/20 backdrop-blur-sm p-6 rounded-lg shadow border dark:border-gray-600 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <FaBell className="text-yellow-500 mr-2" />
              Alertas e Lembretes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alertNotifications.slice(0, 6).map((alert) => {
                const getAlertColor = (type: string) => {
                  switch(type) {
                    case 'payment': return 'border-l-red-500 bg-red-50/80 dark:bg-red-900/20';
                    case 'event': return 'border-l-blue-500 bg-blue-50/80 dark:bg-blue-900/20';
                    case 'task': return 'border-l-orange-500 bg-orange-50/80 dark:bg-orange-900/20';
                    default: return 'border-l-gray-500 bg-gray-50/80 dark:bg-gray-900/20';
                  }
                };
                
                return (
                  <div key={alert.id} className={`border-l-4 p-3 rounded-r-lg ${getAlertColor(alert.type)} max-w-sm`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">{alert.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{alert.message}</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/80 dark:bg-black/40 text-gray-700 dark:text-gray-300 ml-2 flex-shrink-0">
                        {alert.daysLeft === 0 ? 'Hoje' : `${alert.daysLeft}d`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {alertNotifications.length > 6 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                +{alertNotifications.length - 6} alertas adicionais
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
