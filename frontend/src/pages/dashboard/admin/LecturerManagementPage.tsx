import { useState, useEffect } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, MoreHorizontal, BookOpen, Loader2, Bell, Calendar, Hash,
  Eye, UserCheck, UserX, Mail,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { schoolService } from '@/services/school.service';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { name: 'Dashboard',    href: '/dashboard/admin',               icon: Home          },
  { name: 'Students',     href: '/dashboard/admin/students',      icon: GraduationCap },
  { name: 'Lecturers',    href: '/dashboard/admin/lecturers',     icon: Users         },
  { name: 'Departments',  href: '/dashboard/admin/departments',   icon: Building2     },
  { name: 'Matric Config',href: '/dashboard/admin/matric-config', icon: Hash          },
  { name: 'Timetable',    href: '/dashboard/admin/timetable',     icon: Calendar      },
  { name: 'Subscription', href: '/dashboard/admin/subscription',  icon: CreditCard    },
  { name: 'Attendance',   href: '/dashboard/admin/attendance',    icon: BarChart3     },
  { name: 'Notifications',href: '/dashboard/admin/notifications', icon: Bell          },
  { name: 'Settings',     href: '/dashboard/admin/settings',      icon: Settings      },
];

interface LecturerRow {
  id:          string;
  first_name:  string;
  last_name:   string;
  email:       string;
  staff_id:    string | null;
  department:  string | null;
  courseCount: number;
  approval_status: string;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved')
    return <Badge className="bg-green-100 text-green-700 border-0">Approved</Badge>;
  if (status === 'rejected')
    return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>;
}

// ── Profile dialog ─────────────────────────────────────────────────────────────
function LecturerProfileDialog({
  lecturerId,
  open,
  onClose,
  onApprove,
  onReject,
}: {
  lecturerId: string | null;
  open:       boolean;
  onClose:    () => void;
  onApprove:  (id: string) => void;
  onReject:   (id: string) => void;
}) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [acting,  setActing]  = useState(false);

  useEffect(() => {
    if (!open || !lecturerId) return;
    setProfile(null);
    setLoading(true);
    schoolService.getLecturerProfile(lecturerId)
      .then(res => setProfile(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, lecturerId]);

  const u = profile?.user;
  const l = profile;
  const initials = `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase();
  const courses: any[] = l?.courses ?? [];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lecturer Profile</DialogTitle>
          <DialogDescription>Professional and course details</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !profile ? (
          <p className="text-center py-8 text-muted-foreground">Failed to load profile.</p>
        ) : (
          <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {u?.profileImage && <AvatarImage src={u.profileImage} />}
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">
                  {l?.title ? `${l.title} ` : ''}{u?.firstName} {u?.lastName}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">{l?.staffId ?? '—'}</p>
                <div className="mt-1">
                  <StatusBadge status={l?.approvalStatus ?? 'pending'} />
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Personal ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Personal Information
              </p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium truncate">{u?.email ?? '—'}</span>
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{u?.phone ?? '—'}</span>
                <span className="text-muted-foreground">Joined</span>
                <span className="font-medium">
                  {u?.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>

            <Separator />

            {/* ── Professional ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Professional Information
              </p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{l?.department?.name ?? '—'}</span>
                <span className="text-muted-foreground">Qualification</span>
                <span className="font-medium">{l?.qualification ?? '—'}</span>
                <span className="text-muted-foreground">Specialisation</span>
                <span className="font-medium">{l?.specialisation ?? '—'}</span>
                <span className="text-muted-foreground">Courses</span>
                <span className="font-medium">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* ── Courses ── */}
            {courses.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Teaching Courses
                  </p>
                  <div className="space-y-1.5">
                    {courses.map((c: any) => (
                      <div key={c._id ?? c.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground truncate mx-3 flex-1">{c.title}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {c.enrolledStudents?.length ?? 0} students
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Footer for pending lecturers ── */}
        {profile && profile.approvalStatus === 'pending' && lecturerId && (
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={acting}
              onClick={() => { setActing(true); onReject(lecturerId); }}
            >
              <UserX className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              size="sm"
              disabled={acting}
              onClick={() => { setActing(true); onApprove(lecturerId); }}
            >
              <UserCheck className="h-4 w-4 mr-1" /> Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LecturerManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [lecturers, setLecturers] = useState<LecturerRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => { if (user) fetchLecturers(); }, [user]);

  async function fetchLecturers() {
    setLoading(true);
    try {
      const res = await schoolService.getAllLecturers();
      setLecturers((res.data?.data ?? []).map((l: any) => ({
        id:              l._id ?? l.id,
        first_name:      l.user?.firstName  ?? '',
        last_name:       l.user?.lastName   ?? '',
        email:           l.user?.email      ?? '',
        staff_id:        l.staffId          ?? null,
        department:      l.department?.name ?? null,
        courseCount:     l.courses?.length  ?? 0,
        approval_status: l.approvalStatus   ?? 'approved',
      })));
    } catch { setLecturers([]); }
    setLoading(false);
  }

  async function handleApprove(id: string) {
    try {
      await schoolService.approveLecturer(id);
      toast({ title: 'Lecturer approved' });
      setLecturers(prev => prev.map(l => l.id === id ? { ...l, approval_status: 'approved' } : l));
    } catch (err: any) {
      toast({ title: 'Failed', description: err?.message, variant: 'destructive' });
    }
    setViewingId(null);
  }

  async function handleReject(id: string) {
    try {
      await schoolService.rejectLecturer(id);
      toast({ title: 'Lecturer rejected' });
      setLecturers(prev => prev.map(l => l.id === id ? { ...l, approval_status: 'rejected' } : l));
    } catch (err: any) {
      toast({ title: 'Failed', description: err?.message, variant: 'destructive' });
    }
    setViewingId(null);
  }

  const filtered = lecturers.filter(l => {
    const q = search.toLowerCase();
    return !q
      || l.first_name.toLowerCase().includes(q)
      || l.last_name.toLowerCase().includes(q)
      || l.email.toLowerCase().includes(q);
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
              <CardTitle className="text-sm text-muted-foreground font-medium">Total Lecturers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{lecturers.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{lecturers.reduce((a, l) => a + l.courseCount, 0)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{new Set(lecturers.map(l => l.department).filter(Boolean)).size}</div></CardContent>
          </Card>
        </div>

        <div className="relative">
          
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lecturers…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No lecturers found" description="No lecturers match your search." />
        ) : (
          <Card>
            <CardHeader><CardTitle>All Lecturers ({filtered.length})</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {filtered.map(lecturer => (
                <div key={lecturer.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-11 h-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {lecturer.first_name[0]}{lecturer.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{lecturer.first_name} {lecturer.last_name}</p>
                        <StatusBadge status={lecturer.approval_status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{lecturer.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {lecturer.department || '—'} · {lecturer.staff_id} · {lecturer.courseCount} course{lecturer.courseCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingId(lecturer.id)}>
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" /> Send Email
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Lecturer Profile Viewer ── */}
      <LecturerProfileDialog
        lecturerId={viewingId}
        open={!!viewingId}
        onClose={() => setViewingId(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </DashboardLayout>
  );
}