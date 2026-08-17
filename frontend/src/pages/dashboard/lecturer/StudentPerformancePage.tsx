import { useState, useEffect, useMemo } from 'react';
import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, TrendingUp, TrendingDown, User, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { lecturerService } from '@/services/lecturer.service';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/lecturer', icon: Home },
  { name: 'My Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
  { name: 'Attendance', href: '/dashboard/lecturer/attendance', icon: CheckCircle },
  { name: 'Assignments', href: '/dashboard/lecturer/assignments', icon: FileText },
  { name: 'Results', href: '/dashboard/lecturer/results', icon: BarChart3 },
  { name: 'Students', href: '/dashboard/lecturer/students', icon: Users },
  { name: 'Schedule', href: '/dashboard/lecturer/schedule', icon: Calendar },
  { name: 'Profile', href: '/dashboard/lecturer/profile', icon: User },
];

interface StudentRow {
  studentId: string;
  name: string;
  matric: string;
  cgpa: number;
  attendanceRate: number | null;
  assignmentRate: number | null;
  trend: 'up' | 'down' | 'stable' | null;
  risk: 'low' | 'medium' | 'high';
}

export default function LecturerStudentPerformancePage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await lecturerService.getStudentPerformance();
      setStudents(res.data?.data ?? []);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  }

  const filtered = useMemo(
    () =>
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.matric.toLowerCase().includes(search.toLowerCase())
      ),
    [students, search]
  );

  const atRisk = students.filter((s) => s.risk === 'high').length;
  const avgCGPA = students.length
    ? (students.reduce((a, s) => a + s.cgpa, 0) / students.length).toFixed(2)
    : '0.00';
  const topPerformer = students.length
    ? students.reduce((top, s) => (s.cgpa > top.cgpa ? s : top))
    : null;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Lecturer Portal" accentColor="hsl(142, 70%, 45%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Student Performance</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Student Performance Analytics</h1>
          <p className="text-muted-foreground">Monitor individual student progress across your courses</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg CGPA</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{avgCGPA}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">At Risk</CardTitle>
                </CardHeader>
                <CardContent><div className="text-2xl font-bold text-destructive">{atRisk}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    {topPerformer ? `${topPerformer.name} (${topPerformer.cgpa.toFixed(2)})` : '—'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Overview</CardTitle>
                    <CardDescription>Performance across all metrics</CardDescription>
                  </div>
                  <Input
                    placeholder="Search students..."
                    className="w-[250px]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {students.length === 0
                      ? 'No students enrolled in your courses yet.'
                      : `No student matches "${search}".`}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Matric No</TableHead>
                        <TableHead className="text-center">CGPA</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Assignments</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                        <TableHead className="text-center">Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s) => (
                        <TableRow key={s.studentId}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell className="text-muted-foreground">{s.matric}</TableCell>
                          <TableCell className="text-center font-bold">{s.cgpa.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={s.attendanceRate ?? 0} className="h-2 w-20" />
                              <span className="text-sm">{s.attendanceRate !== null ? `${s.attendanceRate}%` : '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={s.assignmentRate ?? 0} className="h-2 w-20" />
                              <span className="text-sm">{s.assignmentRate !== null ? `${s.assignmentRate}%` : '—'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {s.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />}
                            {s.trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive mx-auto" />}
                            {(s.trend === 'stable' || s.trend === null) && (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={s.risk === 'high' ? 'destructive' : s.risk === 'medium' ? 'secondary' : 'default'}>
                              {s.risk}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}