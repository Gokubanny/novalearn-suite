import { useState, useEffect } from 'react';
import { 
  Home, Building2, Users, Shield, BarChart3, Settings,
  Globe, Server, Activity, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Schools', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'Revenue', href: '/dashboard/super-admin/revenue', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Audit Log', href: '/dashboard/super-admin/audit', icon: Shield },
  { name: 'Blog', href: '/dashboard/super-admin/blog', icon: Settings },
  { name: 'Pricing', href: '/dashboard/super-admin/pricing', icon: Settings },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

interface PlatformData {
  totalInstitutions: number;
  totalUsers: number;
  institutions: { id: string; name: string; code: string; is_active: boolean; subscription_plan: string | null }[];
}

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<PlatformData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    setLoading(true);

    const [instRes, usersRes] = await Promise.all([
      supabase.from('institutions').select('id, name, code, is_active, subscription_plan').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);

    setData({
      totalInstitutions: (instRes.data || []).length,
      totalUsers: usersRes.count || 0,
      institutions: (instRes.data || []).slice(0, 5),
    });
    setLoading(false);
  }

  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Super Admin"
      accentColor="hsl(0, 84%, 60%)"
    >
      <div className="space-y-6">
        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton />
            </div>
            <div className="space-y-3">
              <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
            </div>
          </>
        ) : !data ? (
          <EmptyState icon={Building2} title="Unable to load data" description="Please try refreshing the page." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Institutions</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalInstitutions}</div>
                  <p className="text-xs text-muted-foreground">Registered schools</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Platform Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Schools</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.institutions.filter(i => i.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">—</div>
                  <p className="text-xs text-muted-foreground">Connect billing</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Institutions</CardTitle>
                    <CardDescription>Manage all registered institutions</CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/dashboard/super-admin/institutions">
                      <Building2 className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.institutions.length === 0 ? (
                    <EmptyState icon={Building2} title="No institutions" description="No institutions have been registered yet." />
                  ) : (
                    <div className="space-y-4">
                      {data.institutions.map(inst => (
                        <div key={inst.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{inst.name}</p>
                                <Badge variant={inst.is_active ? 'default' : 'secondary'} className="text-xs">
                                  {inst.is_active ? 'active' : 'inactive'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {inst.code} • {inst.subscription_plan || 'Basic'} plan
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/dashboard/super-admin/institutions">Manage</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/super-admin/institutions">
                        <Building2 className="h-5 w-5" />
                        <span className="text-xs">Schools</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/super-admin/users">
                        <Users className="h-5 w-5" />
                        <span className="text-xs">All Users</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/super-admin/audit">
                        <Shield className="h-5 w-5" />
                        <span className="text-xs">Audit Log</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/super-admin/settings">
                        <Settings className="h-5 w-5" />
                        <span className="text-xs">Settings</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
