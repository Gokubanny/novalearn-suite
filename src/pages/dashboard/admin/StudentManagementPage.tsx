import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, Filter, CheckCircle, XCircle, Clock, MoreHorizontal, Mail, Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

const students = [
  { id: 1, name: 'Emeka Johnson', matric: 'CSC/2021/001', email: 'emeka@student.edu.ng', department: 'Computer Science', level: '300', status: 'active', gpa: 3.8 },
  { id: 2, name: 'Amina Bello', matric: 'BUS/2022/045', email: 'amina@student.edu.ng', department: 'Business Admin', level: '200', status: 'active', gpa: 3.5 },
  { id: 3, name: 'David Eze', matric: 'ENG/2023/012', email: 'david@student.edu.ng', department: 'Engineering', level: '100', status: 'pending', gpa: 0 },
  { id: 4, name: 'Kemi Adeyemi', matric: 'CSC/2023/089', email: 'kemi@student.edu.ng', department: 'Computer Science', level: '100', status: 'pending', gpa: 0 },
  { id: 5, name: 'Chidi Obi', matric: 'MED/2020/003', email: 'chidi@student.edu.ng', department: 'Medicine', level: '400', status: 'active', gpa: 4.2 },
  { id: 6, name: 'Fatima Yusuf', matric: 'LAW/2022/018', email: 'fatima@student.edu.ng', department: 'Law', level: '200', status: 'suspended', gpa: 2.8 },
];

export default function StudentManagementPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  const filtered = activeTab === 'all' ? students : students.filter(s => s.status === activeTab);
  const pendingCount = students.filter(s => s.status === 'pending').length;

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Approve, manage, and monitor student accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" />Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</div></CardContent>
          </Card>
          <Card className={pendingCount > 0 ? 'border-orange-300 dark:border-orange-700' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{pendingCount}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{students.filter(s => s.status === 'suspended').length}</div></CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, matric number, or email..." className="pl-9" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending {pendingCount > 0 && <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">{pendingCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {filtered.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{student.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{student.name}</p>
                        <Badge variant={student.status === 'active' ? 'default' : student.status === 'pending' ? 'secondary' : 'destructive'}>
                          {student.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.matric} • {student.email}</p>
                      <p className="text-xs text-muted-foreground">{student.department} • Level {student.level} {student.gpa > 0 && `• GPA: ${student.gpa}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.status === 'pending' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-1" />Approve</Button>
                        <Button size="sm" variant="destructive"><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send Email</DropdownMenuItem>
                        {student.status === 'active' && <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>}
                        {student.status === 'suspended' && <DropdownMenuItem>Reactivate</DropdownMenuItem>}
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
