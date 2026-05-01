import { Home, BookOpen, Users, FileText, BarChart3, Calendar, CheckCircle, TrendingUp, TrendingDown, User } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const students = [
  { name: 'Adebayo Oluwaseun', matric: 'NEX/2024/001', gpa: 3.85, attendance: 92, assignments: 100, trend: 'up', risk: 'low' },
  { name: 'Chinwe Okafor', matric: 'NEX/2024/002', gpa: 3.40, attendance: 85, assignments: 90, trend: 'up', risk: 'low' },
  { name: 'Ibrahim Musa', matric: 'NEX/2024/003', gpa: 2.10, attendance: 60, assignments: 50, trend: 'down', risk: 'high' },
  { name: 'Fatima Abdullahi', matric: 'NEX/2024/004', gpa: 3.90, attendance: 95, assignments: 100, trend: 'up', risk: 'low' },
  { name: 'Emeka Nwankwo', matric: 'NEX/2024/005', gpa: 1.80, attendance: 45, assignments: 30, trend: 'down', risk: 'high' },
  { name: 'Grace Adeyemi', matric: 'NEX/2024/006', gpa: 3.20, attendance: 88, assignments: 85, trend: 'stable', risk: 'low' },
  { name: 'Yusuf Bello', matric: 'NEX/2024/007', gpa: 2.50, attendance: 70, assignments: 60, trend: 'down', risk: 'medium' },
  { name: 'Blessing Eze', matric: 'NEX/2024/008', gpa: 3.60, attendance: 90, assignments: 95, trend: 'up', risk: 'low' },
];

export default function LecturerStudentPerformancePage() {
  const atRisk = students.filter(s => s.risk === 'high').length;
  const avgGPA = (students.reduce((a, s) => a + s.gpa, 0) / students.length).toFixed(2);

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
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg GPA</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{avgGPA}</div></CardContent>
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
            <CardContent><div className="text-sm font-bold">Fatima A. (3.90)</div></CardContent>
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
              <Input placeholder="Search students..." className="w-[250px]" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Matric No</TableHead>
                  <TableHead className="text-center">GPA</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead className="text-center">Trend</TableHead>
                  <TableHead className="text-center">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.matric}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.matric}</TableCell>
                    <TableCell className="text-center font-bold">{s.gpa}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={s.attendance} className="h-2 w-20" />
                        <span className="text-sm">{s.attendance}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={s.assignments} className="h-2 w-20" />
                        <span className="text-sm">{s.assignments}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {s.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />}
                      {s.trend === 'down' && <TrendingDown className="h-4 w-4 text-destructive mx-auto" />}
                      {s.trend === 'stable' && <span className="text-muted-foreground text-sm">—</span>}
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
