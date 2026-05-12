import { useEffect, useRef, useState, useCallback } from 'react';
import { notificationService } from '@/services/notification.service';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string | null;
  link: string | null;
}

function mapNotification(n: any): AppNotification {
  return {
    id: n._id ?? n.id,
    title: n.title,
    message: n.message,
    type: n.type ?? 'info',
    is_read: n.isRead ?? n.is_read ?? false,
    created_at: n.createdAt ?? n.created_at ?? null,
    link: n.link ?? null,
  };
}

/**
 * Polls notifications every `intervalMs` (default 30s) as a WebSocket fallback.
 * Backend currently has no WS endpoint; this hook is structured so it can be
 * upgraded to WS without changing call sites.
 */
export function useNotifications(intervalMs = 30000) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications({ limit: 50 });
      const list: any[] = res.data?.data ?? [];
      setNotifications(list.map(mapNotification));
    } catch {
      /* keep last */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    timerRef.current = window.setInterval(refresh, intervalMs);
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [refresh, intervalMs]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try { await notificationService.markAsRead(id); } catch { /* ignore */ }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try { await notificationService.markAllAsRead(); } catch { /* ignore */ }
  }, []);

  const remove = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try { await notificationService.deleteNotification(id); } catch { /* ignore */ }
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount, loading, refresh, markAsRead, markAllAsRead, remove };
}
