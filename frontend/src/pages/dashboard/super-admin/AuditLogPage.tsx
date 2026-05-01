import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Search, Filter, Shield, AlertTriangle, CheckCircle, Info, Clock
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Schools', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'Revenue', href: '/dashboard/super-admin/revenue', icon: DollarSign },
  { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Audit Log', href: '/dashboard/super-admin/audit', icon: FileText },
  { name: 'Blog', href: '/dashboard/super-admin/blog', icon: Newspaper },
  { name: 'Pricing', href: '/dashboard/super-admin/pricing', icon: Tag },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

const auditLogs = [
  { id: 1, action: 'Institution Suspended', actor: 'Super Admin', target: 'Lagos State University', severity: 'high', timestamp: '2024-03-01 14:32:00', ip: '102.89.23.45' },
  { id: 2, action: 'Plan Upgraded', actor: 'System', target: 'Covenant University', severity: 'info', timestamp: '2024-03-01 12:15:00', ip: 'system' },
  { id: 3, action: 'User Deleted', actor: 'Admin (UNILAG)', target: 'user:david@unilag.edu.ng', severity: 'medium', timestamp: '2024-03-01 10:08:00', ip: '41.58.12.89' },
  { id: 4, action: 'Bulk Enrollment', actor: 'Admin (ABU)', target: '250 students', severity: 'info', timestamp: '2024-02-29 16:45:00', ip: '41.190.2.33' },
  { id: 5, action: 'Login Failed (5 attempts)', actor: 'unknown@email.com', target: 'Auth System', severity: 'high', timestamp: '2024-02-29 14:20:00', ip: '185.220.101.45' },
  { id: 6, action: 'Payment Received', actor: 'System', target: 'University of Lagos', severity: 'info', timestamp: '2024-02-29 09:00:00', ip: 'system' },
  { id: 7, action: 'RLS Policy Updated', actor: 'Super Admin', target: 'Platform Config', severity: 'medium', timestamp: '2024-02-28 18:30:00', ip: '102.89.23.45' },
  { id: 8, action: 'New Institution Added', actor: 'Super Admin', target: 'Federal University Oye-Ekiti', severity: 'info', timestamp: '2024-02-28 11:00:00', ip: '102.89.23.45' },
];

const severityConfig = {
  high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', badge: 'destructive' as const },
  medium: { icon: Shield, color: 'text-orange-500', bg: 'bg-orange-500/10', badge: 'secondary' as const },
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', badge: 'default' as const },
};

export default function AuditLogPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground">Platform-wide activity and security events</p>
          </div>
          <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Export Log</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events (30d)</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">2,847</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Security Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-destructive">12</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Logins</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">34</div></CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search audit logs..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {auditLogs.map((log) => {
                const config = severityConfig[log.severity as keyof typeof severityConfig];
                const Icon = config.icon;
                return (
                  <div key={log.id} className="flex items-start gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{log.action}</p>
                        <Badge variant={config.badge} className="text-xs">{log.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">by <span className="font-medium">{log.actor}</span> → {log.target}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{log.timestamp}</span>
                        <span>IP: {log.ip}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
