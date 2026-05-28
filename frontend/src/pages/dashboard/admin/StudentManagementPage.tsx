import { useState, useEffect } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, CheckCircle, XCircle, Clock, MoreHorizontal, Mail, Eye, Loader2,
  UserCheck, UserX, Hash, Calendar, Bell, BookOpen, TrendingUp, Scan,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  matric_number: string | null;
  department: string | null;
  avatar_url: string | null;
  approval_status: string;
  created_at: string | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved')
    return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Approved</Badge>;
  if (status === 'rejected')
    return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 border-0">Pending</Badge>;
}

// ── Profile dialog ─────────────────────────────────────────────────────────────
function StudentProfileDialog({
  studentId,
  open,
  onClose,
  onApprove,
  onReject,
}: {
  studentId: string | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
}) {
  const [profile, setProfile]   = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [acting,  setActing]    = useState(false);

  useEffect(() => {
    if (!open || !studentId) return;
    setProfile(null);
    setLoading(true);
    schoolService.getStudentProfile(studentId)
      .then(res => setProfile(res.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, studentId]);

  const u = profile?.user;
  const s = profile;
  const initials = `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase();
  const courses: any[] = s?.enrolledCourses ?? [];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Profile</DialogTitle>
          <DialogDescription>Full academic and personal details</DialogDescription>
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
                <h3 className="font-bold text-lg">{u?.firstName} {u?.lastName}</h3>
                <p className="text-sm text-muted-foreground font-mono">{s?.matricNumber ?? '—'}</p>
                <div className="mt-1">
                  <StatusBadge status={s?.approvalStatus ?? 'pending'} />
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
                <span className="text-muted-foreground">Registered</span>
                <span className="font-medium">
                  {u?.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>

            <Separator />

            {/* ── Academic ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Academic Information
              </p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium">{s?.department?.name ?? '—'}</span>
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium">{s?.level ? `${s.level} Level` : '—'}</span>
                <span className="text-muted-foreground">Session</span>
                <span className="font-medium">{s?.currentSession ?? '—'}</span>
                <span className="text-muted-foreground">Semester</span>
                <span className="font-medium">{s?.currentSemester ?? '—'}</span>
              </div>
            </div>

            {/* ── GPA ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">GPA</p>
                <p className="text-2xl font-bold text-primary">{s?.gpa?.toFixed(2) ?? '—'}</p>
              </div>
              <div className="rounded-xl border p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">CGPA</p>
                <p className="text-2xl font-bold">{s?.cgpa?.toFixed(2) ?? '—'}</p>
              </div>
            </div>

            <Separator />

            {/* ── Face Registration ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Face Registration
              </p>
              {s?.faceImageUrl ? (
                <div className="flex items-center gap-3">
                  <img
                    src={s.faceImageUrl}
                    alt="Registered face"
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-600">✓ Face registered</p>
                    <p className="text-xs text-muted-foreground">Can use facial attendance</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Scan className="h-4 w-4" />
                  <span>Face not registered — cannot use facial attendance</span>
                </div>
              )}
            </div>

            {/* ── Enrolled Courses ── */}
            {courses.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Enrolled Courses ({courses.length})
                  </p>
                  <div className="space-y-1.5">
                    {courses.map((c: any) => (
                      <div key={c._id ?? c.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/40">
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground truncate mx-3 flex-1">{c.title}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{c.creditUnits} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Footer actions for pending students ── */}
        {profile && profile.approvalStatus === 'pending' && studentId && (
          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={acting}
              onClick={() => { setActing(true); onReject(studentId); }}
            >
              <UserX className="h-4 w-4 mr-1" /> Reject
            </Button>
            <Button
              size="sm"
              disabled={acting}
              onClick={() => { setActing(true); onApprove(studentId); }}
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
export default function StudentManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [students, setStudents]     = useState<StudentProfile[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [actionDialog, setActionDialog] = useState<{
    student: StudentProfile; action: 'approve' | 'reject';
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  // Profile viewer
  const [viewingId, setViewingId]   = useState<string | null>(null);

  useEffect(() => { if (user) fetchStudents(); }, [user]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await schoolService.getAllStudents({ limit: 200 });
      setStudents((res.data?.data ?? []).map((s: any) => ({
        id:              s._id ?? s.id,
        first_name:      s.user?.firstName ?? '',
        last_name:       s.user?.lastName  ?? '',
        email:           s.user?.email     ?? '',
        matric_number:   s.matricNumber    ?? null,
        department:      s.department?.name ?? null,
        avatar_url:      s.user?.profileImage ?? null,
        approval_status: s.approvalStatus  ?? 'pending',
        created_at:      s.createdAt       ?? null,
      })));
    } catch { setStudents([]); }
    setLoading(false);
  }

  async function handleApproval(student: StudentProfile, action: 'approve' | 'reject') {
    setProcessing(true);
    try {
      if (action === 'approve') {
        await schoolService.approveStudent(student.id);
      } else {
        await schoolService.rejectStudent(student.id, 'Rejected by admin');
      }
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      toast({
        title:       action === 'approve' ? 'Student Approved' : 'Student Rejected',
        description: `${student.first_name} ${student.last_name} has been ${newStatus}.`,
      });
      setStudents(prev => prev.map(s =>
        s.id === student.id ? { ...s, approval_status: newStatus } : s
      ));
    } catch (err: any) {
      toast({ title: 'Action failed', description: err?.message, variant: 'destructive' });
    }
    setProcessing(false);
    setActionDialog(null);
    setViewingId(null);
  }

  // Called from profile dialog approve/reject buttons
  async function approveFromProfile(id: string) {
    const student = students.find(s => s.id === id);
    if (student) await handleApproval(student, 'approve');
  }
  async function rejectFromProfile(id: string) {
    const student = students.find(s => s.id === id);
    if (student) await handleApproval(student, 'reject');
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q
      || s.first_name.toLowerCase().includes(q)
      || s.last_name.toLowerCase().includes(q)
      || s.email.toLowerCase().includes(q)
      || (s.matric_number ?? '').toLowerCase().includes(q);
  });

  const pending  = filtered.filter(s => s.approval_status === 'pending');
  const approved = filtered.filter(s => s.approval_status === 'approved');
  const rejected = filtered.filter(s => s.approval_status === 'rejected');

  const StudentRow = ({ student }: { student: StudentProfile }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="w-10 h-10">
          {student.avatar_url && <AvatarImage src={student.avatar_url} />}
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
            {student.first_name[0]}{student.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{student.first_name} {student.last_name}</p>
            <StatusBadge status={student.approval_status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {student.matric_number || 'No matric'} · {student.email}
          </p>
          {student.department && (
            <p className="text-xs text-muted-foreground">{student.department}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {student.approval_status === 'pending' && (
          <>
            <Button size="sm" onClick={() => setActionDialog({ student, action: 'approve' })}>
              <UserCheck className="h-4 w-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setActionDialog({ student, action: 'reject' })}>
              <UserX className="h-4 w-4 mr-1" /> Reject
            </Button>
          </>
        )}
        {student.approval_status === 'rejected' && (
          <Button size="sm" variant="outline" onClick={() => setActionDialog({ student, action: 'approve' })}>
            <UserCheck className="h-4 w-4 mr-1" /> Approve
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewingId(student.id)}>
              <Eye className="mr-2 h-4 w-4" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" /> Send Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Manage student accounts and approvals</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{students.filter(s => s.approval_status === 'pending').length}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{students.filter(s => s.approval_status === 'approved').length}</div></CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground font-medium">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{students.filter(s => s.approval_status === 'rejected').length}</div></CardContent>
              </Card>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, matric number, or email…"
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending"  className="gap-2"><Clock className="h-4 w-4" /> Pending ({pending.length})</TabsTrigger>
                <TabsTrigger value="approved" className="gap-2"><CheckCircle className="h-4 w-4" /> Approved ({approved.length})</TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2"><XCircle className="h-4 w-4" /> Rejected ({rejected.length})</TabsTrigger>
              </TabsList>

              {[
                { key: 'pending',  list: pending,  emptyTitle: 'No pending requests',  emptyDesc: 'All requests have been reviewed.' },
                { key: 'approved', list: approved, emptyTitle: 'No approved students', emptyDesc: 'Approved students will appear here.' },
                { key: 'rejected', list: rejected, emptyTitle: 'No rejected students', emptyDesc: '' },
              ].map(({ key, list, emptyTitle, emptyDesc }) => (
                <TabsContent key={key} value={key} className="mt-4">
                  {list.length === 0 ? (
                    <EmptyState title={emptyTitle} description={emptyDesc} />
                  ) : (
                    <Card>
                      <CardContent className="pt-6 space-y-3">
                        {list.map(s => <StudentRow key={s.id} student={s} />)}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>

      {/* ── Confirm approve/reject ── */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === 'approve' ? 'Approve Student' : 'Reject Student'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.action === 'approve'
                ? `Approve ${actionDialog?.student.first_name} ${actionDialog?.student.last_name}? They will gain full portal access.`
                : `Reject ${actionDialog?.student.first_name} ${actionDialog?.student.last_name}? They will not be able to access the platform.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={processing}>Cancel</Button>
            <Button
              variant={actionDialog?.action === 'approve' ? 'default' : 'destructive'}
              disabled={processing}
              onClick={() => actionDialog && handleApproval(actionDialog.student, actionDialog.action)}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {actionDialog?.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Student Profile Viewer ── */}
      <StudentProfileDialog
        studentId={viewingId}
        open={!!viewingId}
        onClose={() => setViewingId(null)}
        onApprove={approveFromProfile}
        onReject={rejectFromProfile}
      />
    </DashboardLayout>
  );
}