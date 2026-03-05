import { useState } from 'react';
import {
  Home, Bell, BookOpen, Users, FileText, BarChart3, Calendar, Settings, CheckCircle, User,
  AlertTriangle, Info, Mail, GraduationCap, CreditCard, Shield, Check, Trash2, Filter
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: BookOpen },
  { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

type NotificationType = 'academic' | 'system' | 'financial' | 'security' | 'announcement';
interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'high' | 'medium' | 'info';
  read: boolean;
  time: string;
  actionLabel?: string;
}

const initialNotifications: Notification[] = [
  { id: 1, title: 'New Student Registration', message: 'Ibrahim Musa (NEX/CSC/2024/010) has registered and is awaiting approval.', type: 'academic', priority: 'high', read: false, time: '5 mins ago', actionLabel: 'Review' },
  { id: 2, title: 'Subscription Expiring', message: 'Your Pro plan subscription expires in 7 days. Renew to avoid service interruption.', type: 'financial', priority: 'high', read: false, time: '1 hour ago', actionLabel: 'Renew Now' },
  { id: 3, title: 'System Update Scheduled', message: 'Platform maintenance scheduled for Sunday 2:00 AM - 4:00 AM WAT.', type: 'system', priority: 'medium', read: false, time: '3 hours ago' },
  { id: 4, title: 'Suspicious Login Attempt', message: 'Multiple failed login attempts detected from IP 192.168.1.45 on admin account.', type: 'security', priority: 'high', read: false, time: '5 hours ago', actionLabel: 'Investigate' },
  { id: 5, title: 'Attendance Report Ready', message: 'Monthly attendance analytics report for February 2026 is now available.', type: 'academic', priority: 'info', read: true, time: '1 day ago', actionLabel: 'View Report' },
  { id: 6, title: 'New Lecturer Onboarded', message: 'Dr. Emeka Obi has been added to the Engineering department.', type: 'academic', priority: 'info', read: true, time: '2 days ago' },
  { id: 7, title: 'Platform Update v3.2', message: 'New features: AI-powered attendance, improved analytics dashboard, bulk enrollment.', type: 'announcement', priority: 'medium', read: true, time: '3 days ago' },
  { id: 8, title: 'Payment Received', message: 'Payment of ₦800,000 received for Pro plan renewal.', type: 'financial', priority: 'info', read: true, time: '1 week ago' },
];

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  academic: { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  system: { icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted' },
  financial: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  security: { icon: Shield, color: 'text-destructive', bg: 'bg-red-100 dark:bg-red-900/30' },
  announcement: { icon: Mail, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
};

export default function NotificationCentrePage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotification = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = (n: Notification) => {
    const config = typeConfig[n.type];
    const Icon = config.icon;
    return (
      <motion.div
        key={n.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
          !n.read ? 'bg-primary/5 border-primary/20' : 'bg-background border-border hover:bg-muted/50'
        }`}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                <Badge variant={n.priority === 'high' ? 'destructive' : n.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
                  {n.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-2">{n.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {n.actionLabel && <Button size="sm" className="h-7 text-xs">{n.actionLabel}</Button>}
            {!n.read && (
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => markAsRead(n.id)}>
                <Check className="h-3 w-3 mr-1" /> Mark Read
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteNotification(n.id)}>
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Notification Centre</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Notification Centre
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Manage all platform notifications and alerts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4 mr-1" /> Mark All Read
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {(['academic', 'system', 'financial', 'security', 'announcement'] as NotificationType[]).map(type => {
            const config = typeConfig[type];
            const Icon = config.icon;
            const count = notifications.filter(n => n.type === type && !n.read).length;
            return (
              <Card key={type}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground capitalize">{type}</CardTitle>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">unread</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {notifications.map(renderNotification)}
          </TabsContent>
          <TabsContent value="unread" className="space-y-3">
            {notifications.filter(n => !n.read).length > 0 
              ? notifications.filter(n => !n.read).map(renderNotification)
              : <EmptyState icon={Bell} title="All caught up!" description="You have no unread notifications." />
            }
          </TabsContent>
          <TabsContent value="academic" className="space-y-3">
            {notifications.filter(n => n.type === 'academic').map(renderNotification)}
          </TabsContent>
          <TabsContent value="security" className="space-y-3">
            {notifications.filter(n => n.type === 'security').map(renderNotification)}
          </TabsContent>
          <TabsContent value="financial" className="space-y-3">
            {notifications.filter(n => n.type === 'financial').map(renderNotification)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
