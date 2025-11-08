'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';



export default function Calendar() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [events, setEvents] = useState<Record<string, any[]>>({});
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', time: '', description: '' });
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllEvents(data);

        const groupedEvents: Record<string, any[]> = {};
        data.forEach((event: any) => {
          if (!event.date) return;
          const eventDate = new Date(event.date);
          if (isNaN(eventDate.getTime())) return;
          // Usar UTC para evitar problemas de fuso horário
          const dateKey = eventDate.getUTCFullYear() + '-' + 
            String(eventDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
            String(eventDate.getUTCDate()).padStart(2, '0');
          if (!groupedEvents[dateKey]) {
            groupedEvents[dateKey] = [];
          }
          groupedEvents[dateKey].push({
            id: event.id,
            title: event.title,
            type: 'event',
            time: event.time || '00:00',
            description: event.description,
            date: event.date
          });
        });
        setEvents(groupedEvents);
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
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
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
        console.log('Criando evento:', { title: newEvent.title, date: selectedDate, time: newEvent.time });
        
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

        console.log('Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Evento criado:', result);
          fetchEvents();
          setNewEvent({ title: '', time: '', description: '' });
          setShowEventModal(false);
          alert('Evento criado com sucesso!');
        } else {
          const errorText = await response.text();
          console.error('Erro na resposta:', response.status, errorText);
          
          if (response.status === 401) {
            alert('Sessão expirada. Faça login novamente.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/auth');
          } else {
            alert('Erro ao criar evento');
          }
        }
      } catch (error) {
        console.error('Erro ao criar evento:', error);
        alert('Erro ao criar evento');
      }
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent({ ...event });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: editingEvent.title,
            description: editingEvent.description,
            date: editingEvent.date,
            time: editingEvent.time
          })
        });

        if (response.ok) {
          fetchEvents();
          setShowEditModal(false);
          setEditingEvent(null);
        }
      } catch (error) {
        console.error('Erro ao atualizar evento:', error);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Tem certeza que deseja deletar este evento?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          fetchEvents();
        }
      } catch (error) {
        console.error('Erro ao deletar evento:', error);
      }
    }
  };

  const getAllEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const futureEvents = allEvents
      .filter(event => {
        if (!event.date) return false;
        const eventDate = new Date(event.date);
        if (isNaN(eventDate.getTime())) return false;
        
        // Usar UTC para comparação correta
        const eventDay = new Date(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate());
        return eventDay >= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T00:00:00');
        const dateB = new Date(b.date + 'T00:00:00');
        
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        
        const [hoursA, minutesA] = (a.time || '00:00').split(':');
        const [hoursB, minutesB] = (b.time || '00:00').split(':');
        
        const dateTimeA = new Date(a.date + 'T00:00:00');
        const dateTimeB = new Date(b.date + 'T00:00:00');
        dateTimeA.setHours(parseInt(hoursA), parseInt(minutesA), 0, 0);
        dateTimeB.setHours(parseInt(hoursB), parseInt(minutesB), 0, 0);
        
        return dateTimeA.getTime() - dateTimeB.getTime();
      });
    
    return futureEvents;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`h-24 ${theme.secondaryBg}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events[dateStr] || [];

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-16 border ${theme.border} p-1 cursor-pointer ${theme.hover} transition-colors ${
            dayEvents.length > 0 ? 'bg-blue-500/20 border-blue-500/50' : theme.secondaryBg
          }`}
        >
          <div className={`font-semibold mb-1 text-sm flex items-center justify-between ${
            dayEvents.length > 0 ? 'text-blue-400' : theme.textSecondary
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
              <div className="text-xs text-blue-400">+{dayEvents.length - 2} mais</div>
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
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text}`}>Calendário</h1>
          <p className={`${theme.textSecondary} mt-2`}>Gerencie eventos e compromissos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 ${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${theme.text}`}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className={`px-2 py-1 ${theme.secondaryBg} ${theme.text} rounded ${theme.hover} transition-colors text-sm`}
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
                  className={`px-2 py-1 ${theme.secondaryBg} ${theme.text} rounded ${theme.hover} transition-colors text-sm`}
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-0 mb-2">
              {weekDays.map((day) => (
                <div key={day} className={`p-1 text-center font-semibold ${theme.textSecondary} ${theme.secondaryBg} text-sm`}>
                  {day}
                </div>
              ))}
            </div>

            <div className={`grid grid-cols-7 gap-0 border ${theme.border}`}>
              {renderCalendar()}
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${theme.text}`}>Próximos Eventos</h3>
              {getAllEvents().length > itemsPerPage && (
                <span className={`text-xs ${theme.textSecondary}`}>
                  {currentPage} de {Math.ceil(getAllEvents().length / itemsPerPage)}
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getAllEvents()
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((event: any) => (
                <div key={event.id} className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-3 hover:border-blue-500/50 transition-all duration-200`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-medium ${theme.text} text-sm`}>{event.title}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditEvent(event);
                        }}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/20 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition-colors"
                        title="Deletar"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex items-center"><FaCalendarAlt className="mr-1" /> 
                      {(() => {
                        try {
                          if (!event.date) return 'Data não definida';
                          const date = new Date(event.date);
                          if (isNaN(date.getTime())) return 'Data inválida';
                          return date.toLocaleDateString('pt-BR');
                        } catch {
                          return 'Data inválida';
                        }
                      })()} 
                    </div>
                    <div className="flex items-center"><FaClock className="mr-1" /> {event.time || '00:00'}</div>
                    <div className="px-2 py-1 rounded text-xs text-white bg-blue-500 inline-block">
                      Evento
                    </div>
                    {event.description && (
                      <div className={`mt-2 p-2 ${theme.secondaryBg} rounded text-xs ${theme.textSecondary}`}>
                        {event.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {getAllEvents().length === 0 && (
                <div className={`text-center py-8 ${theme.textSecondary}`}>
                  <FaCalendarAlt className="text-2xl mb-2 mx-auto" />
                  <p className="text-sm">Nenhum evento agendado</p>
                </div>
              )}
            </div>
            
            {getAllEvents().length > itemsPerPage && (
              <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === 1 
                      ? `${theme.textSecondary} cursor-not-allowed` 
                      : `${theme.text} ${theme.secondaryBg} border ${theme.border} hover:${theme.hover}`
                  }`}
                >
                  ←
                </button>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(getAllEvents().length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(getAllEvents().length / itemsPerPage)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === Math.ceil(getAllEvents().length / itemsPerPage)
                      ? `${theme.textSecondary} cursor-not-allowed`
                      : `${theme.text} ${theme.secondaryBg} border ${theme.border} hover:${theme.hover}`
                  }`}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {showEventModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                Adicionar Evento - {(() => {
                  try {
                    if (!selectedDate) return '';
                    const date = new Date(selectedDate + 'T00:00:00');
                    if (isNaN(date.getTime())) return '';
                    return date.toLocaleDateString('pt-BR');
                  } catch {
                    return '';
                  }
                })()}
              </h3>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Título</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    placeholder="Nome do evento"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Horário</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Descrição (opcional)</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                    placeholder="Link da reunião, observações, etc..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
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

        {showEditModal && editingEvent && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Editar Evento</h3>
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Título</label>
                  <input
                    type="text"
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Data</label>
                  <input
                    type="date"
                    value={editingEvent.date}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Horário</label>
                  <input
                    type="time"
                    value={editingEvent.time}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Descrição</label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
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
      </AppLayout>
    </div>
  );
}