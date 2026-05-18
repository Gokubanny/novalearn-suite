import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, PlusCircle, MoreHorizontal, BookOpen, UserCheck, Bell, Calendar, Hash
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const departments = [
  { id: 1, name: 'Computer Science', code: 'CSC', hod: 'Prof. Adebayo', students: 450, lecturers: 12, courses: 24, established: '1985', status: 'active' },
  { id: 2, name: 'Business Administration', code: 'BUS', hod: 'Dr. Fatima Ibrahim', students: 380, lecturers: 10, courses: 18, established: '1990', status: 'active' },
  { id: 3, name: 'Engineering', code: 'ENG', hod: 'Prof. Okonkwo', students: 320, lecturers: 15, courses: 28, established: '1982', status: 'active' },
  { id: 4, name: 'Medicine', code: 'MED', hod: 'Dr. Abubakar', students: 200, lecturers: 20, courses: 32, established: '1978', status: 'active' },
  { id: 5, name: 'Law', code: 'LAW', hod: 'Prof. Nnamdi', students: 180, lecturers: 8, courses: 15, established: '1995', status: 'active' },
  { id: 6, name: 'Data Science', code: 'DSC', hod: 'TBD', students: 0, lecturers: 0, courses: 0, established: '2024', status: 'setup' },
];

export default function DepartmentManagementPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Department Management</h1>
            <p className="text-muted-foreground">Organise and manage academic departments</p>
          </div>
          <Button><PlusCircle className="h-4 w-4 mr-2" />Add Department</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{departments.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{departments.reduce((a, d) => a + d.students, 0).toLocaleString()}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lecturers</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{departments.reduce((a, d) => a + d.lecturers, 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{departments.reduce((a, d) => a + d.courses, 0)}</div></CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search departments..." className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{dept.code}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      <CardDescription>{dept.hod !== 'TBD' ? `HOD: ${dept.hod}` : 'HOD: Not assigned'}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>{dept.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{dept.students}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{dept.lecturers}</p>
                    <p className="text-xs text-muted-foreground">Lecturers</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{dept.courses}</p>
                    <p className="text-xs text-muted-foreground">Courses</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Manage</Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Department</DropdownMenuItem>
                      <DropdownMenuItem>Assign HOD</DropdownMenuItem>
                      <DropdownMenuItem>View Reports</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
