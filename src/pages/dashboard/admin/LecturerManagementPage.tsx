import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, UserPlus, MoreHorizontal, Mail, BookOpen, Star
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
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const lecturers = [
  { id: 1, name: 'Dr. Adebayo Oluwole', email: 'adebayo@uni.edu.ng', department: 'Computer Science', courses: 4, students: 180, rating: 4.8, status: 'active' },
  { id: 2, name: 'Prof. Okonkwo Chukwuma', email: 'okonkwo@uni.edu.ng', department: 'Mathematics', courses: 3, students: 150, rating: 4.5, status: 'active' },
  { id: 3, name: 'Dr. Fatima Ibrahim', email: 'fatima@uni.edu.ng', department: 'Business Admin', courses: 5, students: 220, rating: 4.9, status: 'active' },
  { id: 4, name: 'Dr. Ngozi Eze', email: 'ngozi@uni.edu.ng', department: 'Engineering', courses: 2, students: 90, rating: 4.3, status: 'inactive' },
  { id: 5, name: 'Prof. Abubakar Musa', email: 'abubakar@uni.edu.ng', department: 'Medicine', courses: 3, students: 75, rating: 4.7, status: 'active' },
];

export default function LecturerManagementPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lecturer Management</h1>
            <p className="text-muted-foreground">Invite, manage, and monitor lecturers</p>
          </div>
          <Button><UserPlus className="h-4 w-4 mr-2" />Invite Lecturer</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Lecturers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{lecturers.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{lecturers.reduce((a, l) => a + l.courses, 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{lecturers.reduce((a, l) => a + l.students, 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{(lecturers.reduce((a, l) => a + l.rating, 0) / lecturers.length).toFixed(1)}</div></CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search lecturers..." className="pl-9" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Lecturers</CardTitle>
            <CardDescription>Manage teaching staff across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lecturers.map((lecturer) => (
                <div key={lecturer.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{lecturer.name.split(' ').slice(-1)[0][0]}{lecturer.name.split(' ')[0][0]}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{lecturer.name}</p>
                        <Badge variant={lecturer.status === 'active' ? 'default' : 'secondary'}>{lecturer.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                      <p className="text-xs text-muted-foreground">{lecturer.department} • {lecturer.courses} courses • {lecturer.students} students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{lecturer.rating}</span>
                    </div>
                    <Button variant="outline" size="sm"><Mail className="h-4 w-4" /></Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>View Courses</DropdownMenuItem>
                        <DropdownMenuItem>View Performance</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
