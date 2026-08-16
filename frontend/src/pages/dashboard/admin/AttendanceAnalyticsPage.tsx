import { useState, useEffect } from 'react';
import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  TrendingUp, TrendingDown, Calendar, Loader2, Bell, Hash
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { schoolService } from '@/services/school.service';
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

interface DeptStats { id: string; name: string; total: number; present: number; rate: number; }
interface CourseStats { name: string; code: string; total: number; present: number; rate: number; }

function DepartmentDetailDialog({
  departmentId,
  onOpenChange,
}: {
  departmentId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [overallRate, setOverallRate] = useState(0);
  const [total, setTotal] = useState(0);
  const [present, setPresent] = useState(0);
  const [courses, setCourses] = useState<CourseStats[]>([]);

  useEffect(() => {
    if (!departmentId) return;
    let cancelled = false;

    async function fetchDetail() {
      try {
        const res = await schoolService.getDepartmentAttendanceAnalytics(departmentId);
        if (cancelled) return;
        const data = res.data?.data ?? {};
        setDeptName(data.department?.name ?? '');
        setTotal(data.total ?? 0);
        setPresent(data.present ?? 0);
        setOverallRate(data.rate ?? 0);
        setCourses(
          (data.byCourse ?? []).map((c: any) => ({
            name: c.name, code: c.code, total: c.total ?? 0, present: c.present ?? 0, rate: c.rate ?? 0,
          }))
        );
      } catch {
        if (!cancelled) setError(true);
      }
      if (!cancelled) setLoading(false);
    }

    fetchDetail();
    return () => { cancelled = true; };
  }, [departmentId]);

  return (
    <Dialog open={!!departmentId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{deptName || 'Department Attendance'}</DialogTitle>
          <DialogDescription>Course-by-course attendance breakdown</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : error ? (
          <p className="text-sm text-muted-foreground py-4">Couldn't load this department's attendance data.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold">{overallRate}%</div>
                <div className="text-xs text-muted-foreground">Overall Rate</div>
              </div>
              <div>
                <div className="text-xl font-bold">{total}</div>
                <div className="text-xs text-muted-foreground">Total Records</div>
              </div>
              <div>
                <div className="text-xl font-bold">{present}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </div>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((c) => (
                  <div key={c.code} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{c.name}</span>
                        <Badge variant="outline" className="text-xs">{c.code}</Badge>
                      </div>
                      <span className="font-bold text-sm">{c.rate}%</span>
                    </div>
                    <Progress value={c.rate} className={c.rate < 80 ? '[&>div]:bg-orange-500' : ''} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No attendance records for this department yet.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AttendanceAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);
  const [deptStats, setDeptStats] = useState<DeptStats[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  useEffect(() => { if (user) fetchStats(); }, [user]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await schoolService.getAttendanceAnalytics();
      const data = res.data?.data ?? {};
      setTotalAttendance(data.total ?? 0);
      setTotalPresent(data.present ?? 0);
      setDeptStats(
        (data.byDepartment ?? []).map((d: any) => ({
          id: d.id,
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
                  <CardDescription>Click a department to see the course-by-course breakdown</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deptStats.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => dept.id !== 'unknown' && setSelectedDeptId(dept.id)}
                      disabled={dept.id === 'unknown'}
                      className="w-full text-left space-y-2 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors disabled:hover:bg-transparent disabled:cursor-default"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{dept.name}</span>
                          <Badge variant="outline" className="text-xs">{dept.total} records</Badge>
                        </div>
                        <span className="font-bold text-sm">{dept.rate}%</span>
                      </div>
                      <Progress value={dept.rate} className={dept.rate < 80 ? '[&>div]:bg-orange-500' : ''} />
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        <DepartmentDetailDialog
          key={selectedDeptId ?? 'none'}
          departmentId={selectedDeptId}
          onOpenChange={(open) => !open && setSelectedDeptId(null)}
        />
      </div>
    </DashboardLayout>
  );
}