'use client';
import { useState, useEffect } from 'react';
import { useNotifications } from './useNotifications';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment' | 'event' | 'task';
  date: string;
  read: boolean;
}

export function useAllNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications: alertNotifications } = useNotifications();

  useEffect(() => {
    // Convert alert notifications to notification history
    const convertedNotifications: Notification[] = alertNotifications.map(alert => ({
      id: alert.id,
      title: alert.title,
      message: alert.message,
      type: alert.type,
      date: new Date().toISOString(),
      read: false
    }));

    // Get existing read notifications from localStorage
    const savedNotifications = localStorage.getItem('notificationHistory');
    const existingNotifications: Notification[] = savedNotifications ? JSON.parse(savedNotifications) : [];

    // Merge new alerts with existing history, avoiding duplicates
    const allNotifications = [...convertedNotifications];
    existingNotifications.forEach(existing => {
      if (!allNotifications.find(n => n.id === existing.id)) {
        allNotifications.push(existing);
      }
    });

    // Sort by date (newest first)
    allNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setNotifications(allNotifications);
    setLoading(false);
  }, [alertNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      );
      localStorage.setItem('notificationHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({ ...notif, read: true }));
      localStorage.setItem('notificationHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
}