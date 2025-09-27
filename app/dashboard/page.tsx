'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';
import { useDashboard } from '../../src/hooks/useDashboard';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const { recentEvents, pendingTasks, notifications, loading: dashboardLoading } = useDashboard();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

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
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Bem-vindo, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
            <div className="space-y-3">
              {recentEvents.slice(0, 3).map((event: any) => (
                <div key={event.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum evento próximo</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Pendentes</h3>
            <div className="space-y-3">
              {pendingTasks.slice(0, 3).map((task: any) => (
                <div key={task.id} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.project.name}</p>
                  </div>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma tarefa pendente</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificações</h3>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification: any) => (
                <div key={notification.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-1"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500">{notification.message}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{recentEvents.length}</div>
              <div className="text-sm text-gray-600">Eventos Próximos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
              <div className="text-sm text-gray-600">Tarefas Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Notificações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Pagamentos Pendentes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
