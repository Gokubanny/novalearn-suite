import { useEffect, useRef, useState, useCallback } from 'react';
import { notificationService } from '@/services/notification.service';
import { getSocket } from '@/lib/socket';

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
 * Realtime notifications via Socket.IO with a slow polling fallback
 * (60s) that only runs while the socket is disconnected.
 */
export function useNotifications(fallbackPollMs = 60000) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const pollRef = useRef<number | null>(null);

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

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = window.setInterval(refresh, fallbackPollMs);
  }, [refresh, fallbackPollMs]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    refresh();

    const socket = getSocket();
    if (!socket) {
      startPolling();
      return () => stopPolling();
    }

    const onConnect = () => {
      setIsRealtime(true);
      stopPolling();
      refresh(); // resync after (re)connect
    };
    const onDisconnect = () => {
      setIsRealtime(false);
      startPolling();
    };
    const onNew = (n: any) => {
      const mapped = mapNotification(n);
      setNotifications((prev) =>
        prev.some((x) => x.id === mapped.id) ? prev : [mapped, ...prev]
      );
    };
    const onRead = ({ id }: { id: string }) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    };
    const onReadAll = () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };
    const onDeleted = ({ id }: { id: string }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification:new', onNew);
    socket.on('notification:read', onRead);
    socket.on('notification:read-all', onReadAll);
    socket.on('notification:deleted', onDeleted);

    if (socket.connected) onConnect();
    else startPolling();

    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification:new', onNew);
      socket.off('notification:read', onRead);
      socket.off('notification:read-all', onReadAll);
      socket.off('notification:deleted', onDeleted);
      document.removeEventListener('visibilitychange', onVis);
      stopPolling();
    };
  }, [refresh, startPolling, stopPolling]);

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

  return { notifications, unreadCount, loading, isRealtime, refresh, markAsRead, markAllAsRead, remove };
}
