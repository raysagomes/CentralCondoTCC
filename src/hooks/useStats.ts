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
      
      // Buscar dados do usuário do localStorage
      const userData = localStorage.getItem('user');
      let memberSince = 'N/A';
      
      if (userData) {
        const user = JSON.parse(userData);
        // Se não tiver createdAt no localStorage, buscar da API
        if (!user.createdAt) {
          try {
            const userResponse = await fetch('/api/user', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.ok) {
              const fullUserData = await userResponse.json();
              memberSince = fullUserData.createdAt ? new Date(fullUserData.createdAt).toLocaleDateString('pt-BR') : 'N/A';
            }
          } catch (error) {
            console.log('Erro ao buscar data de criação:', error);
          }
        } else {
          memberSince = new Date(user.createdAt).toLocaleDateString('pt-BR');
        }
      }
      
      setStats({
        projectsCount: projects.length,
        tasksCompleted,
        eventsCreated: events.length,
        paymentsCount: payments.length,
        memberSince
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