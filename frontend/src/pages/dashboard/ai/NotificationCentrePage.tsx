import { useState, useEffect } from 'react';
import {
  Home, Bell, BookOpen, Users, GraduationCap, CreditCard, Settings, Shield,
  Check, Loader2, Mail
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notification.service';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: BookOpen },
  { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string | null;
  link: string | null;
}

const typeIcons: Record<string, typeof Bell> = {
  academic: GraduationCap,
  system: Settings,
  financial: CreditCard,
  security: Shield,
  announcement: Mail,
  info: Bell,
};

export default function NotificationCentrePage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications({ limit: 50 });
      const list: any[] = res.data?.data ?? [];
      setNotifications(
        list.map((n) => ({
          id: n._id ?? n.id,
          title: n.title,
          message: n.message,
          type: n.type ?? 'info',
          is_read: n.isRead ?? false,
          created_at: n.createdAt ?? null,
          link: n.link ?? null,
        }))
      );
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  }

  async function markAsRead(id: string) {
    try { await notificationService.markAsRead(id); } catch {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    try { await notificationService.markAllAsRead(); } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderNotification = (n: Notification) => {
    const Icon = typeIcons[n.type || 'info'] || Bell;
    return (
      <div key={n.id} className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
        !n.is_read ? 'bg-primary/5 border-primary/20' : 'bg-background border-border hover:bg-muted/50'
      }`}>
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-medium ${!n.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
            {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
          <p className="text-xs text-muted-foreground mt-2">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
          {!n.is_read && (
            <Button size="sm" variant="ghost" className="h-7 text-xs mt-2" onClick={() => markAsRead(n.id)}>
              <Check className="h-3 w-3 mr-1" /> Mark Read
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Notification Centre
              {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>}
            </h1>
            <p className="text-muted-foreground">All platform notifications and alerts</p>
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-1" /> Mark All Read
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-3">
              {notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No notifications" description="You have no notifications yet." />
              ) : notifications.map(renderNotification)}
            </TabsContent>
            <TabsContent value="unread" className="space-y-3">
              {unreadCount === 0 ? (
                <EmptyState icon={Bell} title="All caught up!" description="You have no unread notifications." />
              ) : notifications.filter(n => !n.is_read).map(renderNotification)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
