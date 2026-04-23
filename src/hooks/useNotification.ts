import { useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const notification: Notification = { id, type, message, duration };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = {
    success: (message: string, duration?: number) =>
      addNotification('success', message, duration),
    error: (message: string, duration?: number) =>
      addNotification('error', message, duration),
    info: (message: string, duration?: number) =>
      addNotification('info', message, duration),
    warning: (message: string, duration?: number) =>
      addNotification('warning', message, duration),
  };

  return { notifications, addNotification, removeNotification, notify };
}
