import { useState, useEffect } from 'react';
import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, MoreHorizontal, Mail, BookOpen, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
  { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
  { name: 'Lecturers', href: '/dashboard/admin/lecturers', icon: Users },
  { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
  { name: 'Subscription', href: '/dashboard/admin/subscription', icon: CreditCard },
  { name: 'Attendance', href: '/dashboard/admin/attendance', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

interface LecturerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  staff_id: string | null;
  department: string | null;
  courseCount: number;
}

export default function LecturerManagementPage() {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { if (user) fetchLecturers(); }, [user]);

  async function fetchLecturers() {
    setLoading(true);
    const { data: adminProfile } = await supabase.from('profiles').select('institution_id').eq('user_id', user!.id).single();
    if (!adminProfile?.institution_id) { setLoading(false); return; }

    // Get profiles with staff_id (lecturers typically have staff_id set)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, staff_id, department')
      .eq('institution_id', adminProfile.institution_id)
      .not('staff_id', 'is', null);

    if (!profiles) { setLecturers([]); setLoading(false); return; }

    // Count courses per lecturer
    const lecturerIds = profiles.map(p => p.id);
    const { data: courses } = await supabase
      .from('courses')
      .select('lecturer_id')
      .in('lecturer_id', lecturerIds.length ? lecturerIds : ['none']);

    const countMap = new Map<string, number>();
    courses?.forEach(c => { if (c.lecturer_id) countMap.set(c.lecturer_id, (countMap.get(c.lecturer_id) || 0) + 1); });

    setLecturers(profiles.map(p => ({ ...p, courseCount: countMap.get(p.id) || 0 })));
    setLoading(false);
  }

  const filtered = lecturers.filter(l => {
    const q = search.toLowerCase();
    return !q || l.first_name.toLowerCase().includes(q) || l.last_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lecturer Management</h1>
          <p className="text-muted-foreground">Manage teaching staff across departments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CardContent><div className="text-2xl font-bold">{lecturers.reduce((a, l) => a + l.courseCount, 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{new Set(lecturers.map(l => l.department).filter(Boolean)).size}</div></CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search lecturers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No lecturers found" description="No lecturers match your search." />
        ) : (
          <Card>
            <CardHeader><CardTitle>All Lecturers</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filtered.map(lecturer => (
                <div key={lecturer.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{lecturer.first_name[0]}{lecturer.last_name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{lecturer.first_name} {lecturer.last_name}</p>
                      <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                      <p className="text-xs text-muted-foreground">{lecturer.department || '—'} • {lecturer.staff_id} • {lecturer.courseCount} courses</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>View Courses</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
