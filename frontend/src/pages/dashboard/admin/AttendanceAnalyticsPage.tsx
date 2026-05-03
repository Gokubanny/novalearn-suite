import { useState, useEffect } from 'react';
import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  TrendingUp, TrendingDown, Calendar, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { schoolService } from '@/services/school.service';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

interface DeptStats { name: string; total: number; present: number; rate: number; }

export default function AttendanceAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [deptStats, setDeptStats] = useState<DeptStats[]>([]);

  useEffect(() => { if (user) fetchStats(); }, [user]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await schoolService.getStats();
      const stats = res.data?.data ?? {};
      // Backend may expose attendance summary; fall back to zeros if not available.
      const att = stats.attendance ?? {};
      setTotalAttendance(att.total ?? 0);
      setTotalPresent(att.present ?? 0);
      setDeptStats(
        (att.byDepartment ?? []).map((d: any) => ({
          name: d.name,
          total: d.total ?? 0,
          present: d.present ?? 0,
          rate: d.total ? Math.round((d.present / d.total) * 100) : 0,
        }))
      );
    } catch {
      setTotalAttendance(0);
      setTotalPresent(0);
      setDeptStats([]);
    }
    setLoading(false);
  }

  const overallRate = totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Attendance Analytics</h1>
          <p className="text-muted-foreground">Institution-wide attendance overview</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Overall Rate</CardTitle>
                  <BarChart3 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{overallRate}%</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{totalAttendance}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{totalPresent}</div></CardContent>
              </Card>
            </div>

            {deptStats.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attendance by Department</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deptStats.map(dept => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{dept.name}</span>
                          <Badge variant="outline" className="text-xs">{dept.total} records</Badge>
                        </div>
                        <span className="font-bold text-sm">{dept.rate}%</span>
                      </div>
                      <Progress value={dept.rate} className={dept.rate < 80 ? '[&>div]:bg-orange-500' : ''} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
