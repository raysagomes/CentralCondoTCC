import { useState, useEffect } from 'react';

interface NotificationItem {
  id: string;
  type: 'payment' | 'event' | 'task';
  title: string;
  message: string;
  daysLeft: number;
  date: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const getNotificationSettings = () => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      paymentNotifications: true,
      paymentDays14: false,
      paymentDays7: true,
      eventNotifications: true,
      eventDays14: false,
      eventDays7: true,
      taskNotifications: true,
      taskDays14: false,
      taskDays7: true
    };
  };

  const generateNotifications = async () => {
    const settings = getNotificationSettings();
    const newNotifications: NotificationItem[] = [];

    try {
      // Buscar pagamentos pendentes
      if (settings.paymentNotifications) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch('/api/payments', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
              const payments = await response.json();
              const pendingPayments = payments.filter((p: any) => !p.paid);
              
              pendingPayments.forEach((payment: any) => {
                const dueDate = new Date(payment.dueDate);
                const today = new Date();
                const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysLeft >= 0) {
                  if ((settings.paymentDays14 && daysLeft <= 14) || (settings.paymentDays7 && daysLeft <= 7)) {
                    newNotifications.push({
                      id: `payment-${payment.id}`,
                      type: 'payment',
                      title: `Pagamento vencendo: ${payment.title}`,
                      message: `Vence em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} - R$ ${payment.amount.toFixed(2)}`,
                      daysLeft,
                      date: payment.dueDate
                    });
                  }
                }
              });
            }
          } catch (error) {
            console.error('Erro ao buscar pagamentos:', error);
          }
        }
      }

      // Buscar eventos próximos (mock - você pode implementar a API)
      if (settings.eventNotifications) {
        // Exemplo de eventos mock
        const mockEvents = [
          { id: '1', title: 'Reunião de Condomínio', date: '2024-11-01', description: 'Assembleia geral' },
          { id: '2', title: 'Manutenção Elevador', date: '2024-11-05', description: 'Manutenção preventiva' }
        ];

        mockEvents.forEach(event => {
          const eventDate = new Date(event.date);
          const today = new Date();
          const daysLeft = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft >= 0) {
            if ((settings.eventDays14 && daysLeft <= 14) || (settings.eventDays7 && daysLeft <= 7)) {
              newNotifications.push({
                id: `event-${event.id}`,
                type: 'event',
                title: `Evento próximo: ${event.title}`,
                message: `Em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} - ${event.description}`,
                daysLeft,
                date: event.date
              });
            }
          }
        });
      }

      // Buscar tarefas pendentes (mock - você pode implementar a API)
      if (settings.taskNotifications) {
        // Exemplo de tarefas mock
        const mockTasks = [
          { id: '1', title: 'Revisar documentos', dueDate: '2024-11-03', project: 'Projeto A' },
          { id: '2', title: 'Preparar relatório', dueDate: '2024-11-07', project: 'Projeto B' }
        ];

        mockTasks.forEach(task => {
          const dueDate = new Date(task.dueDate);
          const today = new Date();
          const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft >= 0) {
            if ((settings.taskDays14 && daysLeft <= 14) || (settings.taskDays7 && daysLeft <= 7)) {
              newNotifications.push({
                id: `task-${task.id}`,
                type: 'task',
                title: `Tarefa pendente: ${task.title}`,
                message: `Vence em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} - ${task.project}`,
                daysLeft,
                date: task.dueDate
              });
            }
          }
        });
      }

      setNotifications(newNotifications.sort((a, b) => a.daysLeft - b.daysLeft));
    } catch (error) {
      console.error('Erro ao gerar notificações:', error);
    }
  };

  useEffect(() => {
    generateNotifications();
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(generateNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    refreshNotifications: generateNotifications
  };
};