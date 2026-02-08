import { 
  Home, 
  Building2, 
  Users, 
  Shield, 
  BarChart3, 
  Settings,
  Search,
  PlusCircle,
  MoreHorizontal,
  Globe,
  CheckCircle,
  Clock
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Institutions', href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'All Users', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Access Control', href: '/dashboard/super-admin/access', icon: Shield },
  { name: 'Analytics', href: '/dashboard/super-admin/analytics', icon: BarChart3 },
  { name: 'System', href: '/dashboard/super-admin/system', icon: Settings },
];

const institutions = [
  { 
    id: 1,
    name: 'University of Lagos', 
    domain: 'unilag.edu.ng',
    students: 12500, 
    lecturers: 450,
    status: 'active', 
    plan: 'Enterprise',
    createdAt: '2023-01-15'
  },
  { 
    id: 2,
    name: 'Covenant University', 
    domain: 'covenantuniversity.edu.ng',
    students: 8200, 
    lecturers: 320,
    status: 'active', 
    plan: 'Pro',
    createdAt: '2023-03-20'
  },
  { 
    id: 3,
    name: 'Ahmadu Bello University', 
    domain: 'abu.edu.ng',
    students: 15000, 
    lecturers: 580,
    status: 'active', 
    plan: 'Enterprise',
    createdAt: '2023-02-10'
  },
  { 
    id: 4,
    name: 'Lagos State University', 
    domain: 'lasu.edu.ng',
    students: 9800, 
    lecturers: 380,
    status: 'pending', 
    plan: 'Basic',
    createdAt: '2024-01-05'
  },
  { 
    id: 5,
    name: 'Federal University of Technology', 
    domain: 'futa.edu.ng',
    students: 6500, 
    lecturers: 250,
    status: 'active', 
    plan: 'Pro',
    createdAt: '2023-06-18'
  },
];

export default function SuperAdminInstitutionsPage() {
  return (
    <DashboardLayout 
      navItems={navItems} 
      roleLabel="Super Admin"
      accentColor="hsl(0, 84%, 60%)"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Institutions</h1>
            <p className="text-muted-foreground">Manage registered institutions</p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search institutions..." className="pl-9" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{institutions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{institutions.filter(i => i.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{institutions.filter(i => i.status === 'pending').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {institutions.reduce((acc, i) => acc + i.students + i.lecturers, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Institutions</CardTitle>
            <CardDescription>View and manage registered institutions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {institutions.map((institution) => (
                <div 
                  key={institution.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{institution.name}</p>
                        <Badge variant={institution.status === 'active' ? 'default' : 'secondary'}>
                          {institution.status}
                        </Badge>
                        <Badge variant="outline">{institution.plan}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {institution.domain}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {institution.students.toLocaleString()} students • {institution.lecturers.toLocaleString()} lecturers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">View Dashboard</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Institution</DropdownMenuItem>
                        <DropdownMenuItem>Manage Admins</DropdownMenuItem>
                        <DropdownMenuItem>View Billing</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend</DropdownMenuItem>
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
