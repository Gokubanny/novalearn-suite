import { useState, useEffect } from 'react';
import { 
  Home, Users, BookOpen, Building2, BarChart3, Settings,
  UserPlus, FileText, Bell, Hash, Calendar, CreditCard,
  GraduationCap, AlertTriangle, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription, getPlanLabel } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Matric Config', href: '/dashboard/admin/matric-config', icon: Hash },
  { name: 'Timetable', href: '/dashboard/admin/timetable', icon: Calendar },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Notifications', href: '/dashboard/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

interface AdminData {
  totalUsers: number;
  pendingApprovals: number;
  totalCourses: number;
  totalDepartments: number;
  departments: { id: string; name: string; code: string }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { plan, limits } = useSubscription();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboard();
  }, [user]);

  async function fetchDashboard() {
    if (!user) return;
    setLoading(true);

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile?.institution_id) { setLoading(false); return; }

    const instId = adminProfile.institution_id;

    // Parallel queries
    const [usersRes, coursesRes, deptsRes, pendingRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('institution_id', instId),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('institution_id', instId).eq('is_active', true),
      supabase.from('departments').select('id, name, code').eq('institution_id', instId),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('institution_id', instId).eq('approval_status', 'pending'),
    ]);

    setData({
      totalUsers: usersRes.count || 0,
      totalCourses: coursesRes.count || 0,
      totalDepartments: (deptsRes.data || []).length,
      pendingApprovals: pendingRes.count || 0,
      departments: (deptsRes.data || []).slice(0, 5),
    });
    setLoading(false);
  }

  const studentPct = data && limits.maxStudents !== Infinity 
    ? Math.round((data.totalUsers / limits.maxStudents) * 100) : 10;

  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Admin Portal"
      accentColor="hsl(262, 83%, 58%)"
    >
      <div className="space-y-6">
        {/* Plan Badge */}
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {getPlanLabel(plan)} Plan
          </Badge>
        </div>

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
          <EmptyState 
            icon={Building2}
            title="No institution linked" 
            description="Your profile is not linked to an institution. Contact support for assistance."
          />
        ) : (
          <>
            {data.pendingApprovals > 0 && (
              <Alert className="border-warning/50 bg-warning/10">
                <Clock className="h-4 w-4 text-warning" />
                <AlertDescription className="text-sm">
                  You have <strong>{data.pendingApprovals}</strong> student{data.pendingApprovals !== 1 ? 's' : ''} waiting for approval.{' '}
                  <Link to="/dashboard/admin/students" className="text-primary hover:underline font-medium">
                    Review now →
                  </Link>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">In your institution</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.pendingApprovals}</div>
                  <p className="text-xs text-warning">{data.pendingApprovals > 0 ? 'Action needed' : 'All clear'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalCourses}</div>
                  <p className="text-xs text-muted-foreground">This semester</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.totalDepartments}</div>
                  <p className="text-xs text-muted-foreground">Active departments</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Departments Overview</CardTitle>
                    <CardDescription>Manage institutional departments</CardDescription>
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/dashboard/admin/departments">
                      <Building2 className="h-4 w-4 mr-2" />
                      Manage
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.departments.length === 0 ? (
                    <EmptyState icon={Building2} title="No departments" description="Create departments to organize your institution." />
                  ) : (
                    <div className="space-y-4">
                      {data.departments.map(dept => (
                        <div key={dept.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{dept.name}</p>
                              <p className="text-sm text-muted-foreground">{dept.code}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/dashboard/admin/departments">View</Link>
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
                      <Link to="/dashboard/admin/students">
                        <GraduationCap className="h-5 w-5" />
                        <span className="text-xs">Students</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/admin/lecturers">
                        <Users className="h-5 w-5" />
                        <span className="text-xs">Lecturers</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/admin/departments">
                        <Building2 className="h-5 w-5" />
                        <span className="text-xs">Departments</span>
                      </Link>
                    </Button>
                    <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                      <Link to="/dashboard/admin/settings">
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
