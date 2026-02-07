import { 
  Home, 
  Building2, 
  Users, 
  Shield, 
  BarChart3, 
  Settings,
  Globe,
  Server,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Institutions', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'All Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Access Control', href: '/dashboard/super-admin/access', icon: Shield },
  { name: 'Analytics', href: '/dashboard/super-admin/analytics', icon: BarChart3 },
  { name: 'System', href: '/dashboard/super-admin/system', icon: Settings },
];

const institutions = [
  { name: 'University of Lagos', students: 12500, status: 'active', plan: 'Enterprise' },
  { name: 'Covenant University', students: 8200, status: 'active', plan: 'Pro' },
  { name: 'Ahmadu Bello University', students: 15000, status: 'active', plan: 'Enterprise' },
  { name: 'Lagos State University', students: 9800, status: 'pending', plan: 'Basic' },
];

const systemHealth = [
  { name: 'API Server', status: 'healthy', uptime: 99.9 },
  { name: 'Database', status: 'healthy', uptime: 99.8 },
  { name: 'Storage', status: 'warning', uptime: 98.5 },
  { name: 'CDN', status: 'healthy', uptime: 99.9 },
];

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Super Admin"
      accentColor="hsl(0, 84%, 60%)"
    >
      <div className="space-y-6">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Institutions
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-green-600">+3 this quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Platform Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">125,430</div>
              <p className="text-xs text-green-600">+12% growth</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Sessions
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,542</div>
              <p className="text-xs text-muted-foreground">Real-time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Revenue
              </CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦45.2M</div>
              <p className="text-xs text-green-600">+18% from last month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Institutions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Institutions</CardTitle>
                <CardDescription>Manage all registered institutions</CardDescription>
              </div>
              <Button size="sm">
                <Building2 className="h-4 w-4 mr-2" />
                Add Institution
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {institutions.map((inst) => (
                  <div 
                    key={inst.name} 
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{inst.name}</p>
                          <Badge 
                            variant={inst.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {inst.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {inst.students.toLocaleString()} users • {inst.plan} plan
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Infrastructure status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((system) => (
                <div key={system.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        system.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium">{system.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{system.uptime}%</span>
                  </div>
                  <Progress 
                    value={system.uptime} 
                    className={`h-1.5 ${system.status === 'warning' ? '[&>div]:bg-yellow-500' : ''}`}
                  />
                </div>
              ))}
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-xs">Storage capacity at 85%. Consider scaling.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Building2 className="h-5 w-5" />
                <span className="text-xs">Add Institution</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-xs">Manage Access</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs">View Analytics</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
                <Settings className="h-5 w-5" />
                <span className="text-xs">Platform Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
