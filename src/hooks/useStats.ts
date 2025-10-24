import { useState, useEffect } from 'react';

interface Stats {
  projectsCount: number;
  tasksCompleted: number;
  eventsCreated: number;
  paymentsCount: number;
  memberSince: string;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    projectsCount: 0,
    tasksCompleted: 0,
    eventsCreated: 0,
    paymentsCount: 0,
    memberSince: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Buscar projetos
      const projectsResponse = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projects = projectsResponse.ok ? await projectsResponse.json() : [];
      
      // Buscar tarefas concluídas
      const tasksCompleted = projects.reduce((total: number, project: any) => {
        return total + (project.tasks?.filter((task: any) => task.status === 'COMPLETED').length || 0);
      }, 0);
      
      // Buscar eventos
      const eventsResponse = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const events = eventsResponse.ok ? await eventsResponse.json() : [];
      
      // Buscar pagamentos
      const paymentsResponse = await fetch('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const payments = paymentsResponse.ok ? await paymentsResponse.json() : [];
      
      // Buscar dados do usuário
      const userResponse = await fetch('/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = userResponse.ok ? await userResponse.json() : {};
      
      setStats({
        projectsCount: projects.length,
        tasksCompleted,
        eventsCreated: events.length,
        paymentsCount: payments.length,
        memberSince: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('pt-BR') : ''
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
}