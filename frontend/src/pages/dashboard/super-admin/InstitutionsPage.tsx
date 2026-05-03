import { useState, useEffect } from 'react';
import { 
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Search, PlusCircle, MoreHorizontal, Globe, CheckCircle, Clock, Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { superAdminService } from '@/services/superadmin.service';
import { EmptyState } from '@/components/dashboard/EmptyState';

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

interface Institution {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  subscription_plan: string | null;
  city: string | null;
  state: string | null;
  created_at: string | null;
  profileCount: number;
}

export default function SuperAdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchInstitutions(); }, []);

  async function fetchInstitutions() {
    setLoading(true);
    try {
      const res = await superAdminService.getAllSchools({ limit: 100 });
      const list = (res.data?.data ?? []).map((s: any) => ({
        id: s._id ?? s.id,
        name: s.name,
        code: s.code,
        is_active: s.isActive ?? true,
        subscription_plan: s.subscription?.plan ?? null,
        city: s.city ?? null,
        state: s.state ?? null,
        created_at: s.createdAt ?? null,
        profileCount: (s.studentCount ?? 0) + (s.lecturerCount ?? 0),
      }));
      setInstitutions(list);
    } catch {
      setInstitutions([]);
    }
    setLoading(false);
  }

  const filtered = institutions.filter(i => {
    const q = search.toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Institutions</h1>
            <p className="text-muted-foreground">Manage registered institutions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{institutions.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{institutions.filter(i => i.is_active).length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{institutions.filter(i => !i.is_active).length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{institutions.reduce((a, i) => a + i.profileCount, 0)}</div></CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search institutions..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No institutions" description="No institutions found." />
        ) : (
          <Card>
            <CardHeader><CardTitle>All Institutions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {filtered.map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{inst.name}</p>
                        <Badge variant={inst.is_active ? 'default' : 'secondary'}>{inst.is_active ? 'active' : 'inactive'}</Badge>
                        <Badge variant="outline">{inst.subscription_plan || 'basic'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{inst.code} {inst.city ? `• ${inst.city}` : ''} {inst.state ? `, ${inst.state}` : ''}</p>
                      <p className="text-xs text-muted-foreground">{inst.profileCount} users</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Manage Admins</DropdownMenuItem>
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
