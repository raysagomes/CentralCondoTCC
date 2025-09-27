import { useState, useEffect } from 'react';

interface DashboardData {
  recentEvents: any[];
  pendingTasks: any[];
  notifications: any[];
}

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    recentEvents: [],
    pendingTasks: [],
    notifications: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    ...data,
    loading,
    refetch: fetchDashboardData
  };
};