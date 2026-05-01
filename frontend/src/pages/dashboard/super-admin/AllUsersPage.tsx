import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Search, Filter, MoreHorizontal, GraduationCap, UserCheck, Shield
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Schools', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'Revenue', href: '/dashboard/super-admin/revenue', icon: DollarSign },
  { name: 'Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Audit Log', href: '/dashboard/super-admin/audit', icon: FileText },
  { name: 'Blog', href: '/dashboard/super-admin/blog', icon: Newspaper },
  { name: 'Pricing', href: '/dashboard/super-admin/pricing', icon: Tag },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

const allUsers = [
  { id: 1, name: 'Emeka Johnson', email: 'emeka@unilag.edu.ng', role: 'student', institution: 'University of Lagos', status: 'active' },
  { id: 2, name: 'Dr. Adebayo', email: 'adebayo@unilag.edu.ng', role: 'lecturer', institution: 'University of Lagos', status: 'active' },
  { id: 3, name: 'Admin Covenant', email: 'admin@covenant.edu.ng', role: 'admin', institution: 'Covenant University', status: 'active' },
  { id: 4, name: 'Amina Bello', email: 'amina@abu.edu.ng', role: 'student', institution: 'Ahmadu Bello University', status: 'active' },
  { id: 5, name: 'Prof. Okonkwo', email: 'okonkwo@lasu.edu.ng', role: 'lecturer', institution: 'Lagos State University', status: 'suspended' },
  { id: 6, name: 'David Eze', email: 'david@covenant.edu.ng', role: 'student', institution: 'Covenant University', status: 'pending' },
];

const roleIcon = (role: string) => {
  switch (role) {
    case 'student': return <GraduationCap className="h-4 w-4" />;
    case 'lecturer': return <UserCheck className="h-4 w-4" />;
    case 'admin': return <Shield className="h-4 w-4" />;
    default: return <Users className="h-4 w-4" />;
  }
};

export default function AllUsersPage() {
  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">All users across all institutions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle><Users className="h-4 w-4 text-primary" /></CardHeader><CardContent><div className="text-2xl font-bold">125,430</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Students</CardTitle><GraduationCap className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">118,200</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Lecturers</CardTitle><UserCheck className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">6,890</div></CardContent></Card>
          <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle><Shield className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">340</div></CardContent></Card>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users across all institutions..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Institution" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Institutions</SelectItem>
              <SelectItem value="unilag">University of Lagos</SelectItem>
              <SelectItem value="covenant">Covenant University</SelectItem>
              <SelectItem value="abu">Ahmadu Bello University</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {allUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {roleIcon(user.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge variant={user.status === 'active' ? 'default' : user.status === 'pending' ? 'secondary' : 'destructive'}>{user.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.institution}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Impersonate</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
