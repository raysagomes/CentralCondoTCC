import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  projectId: string;
}

export const useCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (title: string, description: string, date: string, time: string, projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, date, time, projectId })
      });

      if (response.ok) {
        await fetchEvents();
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao criar evento' };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    refetch: fetchEvents
  };
};