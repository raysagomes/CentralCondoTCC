'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';

const eventTypes = [
  { id: 'maintenance', name: 'Manutenção', color: 'bg-orange-500' },
  { id: 'meeting', name: 'Reunião', color: 'bg-blue-500' },
  { id: 'event', name: 'Evento', color: 'bg-green-500' },
  { id: 'deadline', name: 'Prazo', color: 'bg-red-500' },
  { id: 'other', name: 'Outro', color: 'bg-purple-500' }
];

export default function Calendar() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', type: 'meeting', time: '', description: '' });

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Buscando eventos...');
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setAllEvents(data);

        // Agrupar eventos por data
        const groupedEvents: Record<string, any[]> = {};
        data.forEach((event: any) => {
          const eventDate = new Date(event.date);
          const dateKey = eventDate.toISOString().split('T')[0];
          if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
          }
          groupedEvents[dateKey].push({
            id: event.id,
            title: event.title,
            type: 'event',
            time: event.time || '00:00',
            description: event.description
          });
        });
        console.log('Eventos agrupados:', groupedEvents);
        setEvents(groupedEvents);
      } else {
        console.error('Erro na API:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(dateStr);
    setShowEventModal(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && newEvent.title) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: newEvent.title,
            description: newEvent.description,
            date: selectedDate,
            time: newEvent.time
          })
        });

        if (response.ok) {
          fetchEvents();
          setNewEvent({ title: '', type: 'meeting', time: '', description: '' });
          setShowEventModal(false);
        }
      } catch (error) {
        console.error('Erro ao criar evento:', error);
      }
    }
  };

  const getAllEvents = () => {
    return allEvents.sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events[dateStr] || [];

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-16 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${dayEvents.length > 0 ? 'bg-blue-50 border-blue-200' : ''
            }`}
        >
          <div className={`font-semibold mb-1 text-sm flex items-center justify-between ${dayEvents.length > 0 ? 'text-blue-900' : 'text-gray-900'
            }`}>
            {day}
            {dayEvents.length > 0 && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event: any) => (
              <div key={event.id} className="text-xs text-white px-1 py-0.5 rounded bg-blue-500 truncate">
                {event.title.length > 8 ? event.title.substring(0, 8) + '...' : event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-blue-600">+{dayEvents.length - 2} mais</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600 mt-2">Gerencie eventos e compromissos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="p-1 text-center font-semibold text-gray-700 bg-gray-100 text-sm">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0 border border-gray-200">
              {renderCalendar()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Eventos</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getAllEvents().slice(0, 10).map((event: any) => (
                <div key={event.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>📅 {new Date(event.date).toLocaleDateString('pt-BR')}</div>
                    <div>🕐 {event.time || '00:00'}</div>
                    <div className="px-2 py-1 rounded text-xs text-white bg-blue-500 inline-block">
                      Evento
                    </div>
                    {event.description && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              ))
            }
              {getAllEvents().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">📅</div>
                  <p className="text-sm">Nenhum evento agendado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Adicionar Evento - {selectedDate ? new Date(selectedDate).toLocaleDateString('pt-BR') : ''}</h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do evento"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Link da reunião, observações, etc..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
