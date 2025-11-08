import { useEffect } from 'react';

export const useNotificationChecker = () => {
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        await fetch('/api/notifications/check', {
          method: 'POST'
        });
      } catch (error) {
        console.error('Erro ao verificar notificações:', error);
      }
    };

    // Executar imediatamente
    checkNotifications();

    // Executar a cada 30 minutos
    const interval = setInterval(checkNotifications, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};