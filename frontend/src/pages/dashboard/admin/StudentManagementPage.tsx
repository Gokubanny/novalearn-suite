import { useState, useEffect } from 'react';
import { 
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, CheckCircle, XCircle, Clock, MoreHorizontal, Mail, Eye, Loader2,
  UserCheck, UserX, Hash, Calendar, Bell
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { schoolService } from '@/services/school.service';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { useToast } from '@/hooks/use-toast';

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

interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  matric_number: string | null;
  department: string | null;
  avatar_url: string | null;
  approval_status: string;
  created_at: string | null;
}

export default function StudentManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionDialog, setActionDialog] = useState<{ student: StudentProfile; action: 'approve' | 'reject' } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { if (user) fetchStudents(); }, [user]);

  async function fetchStudents() {
    setLoading(true);
    try {
      const res = await schoolService.getAllStudents({ limit: 200 });
      const list: StudentProfile[] = (res.data?.data ?? []).map((s: any) => ({
        id: s._id ?? s.id,
        user_id: s.user?._id ?? s.user?.id ?? s.user ?? s._id,
        first_name: s.user?.firstName ?? s.firstName ?? '',
        last_name: s.user?.lastName ?? s.lastName ?? '',
        email: s.user?.email ?? s.email ?? '',
        matric_number: s.matricNumber ?? null,
        department: s.department?.name ?? s.department ?? null,
        avatar_url: s.user?.profileImage ?? null,
        approval_status: s.approvalStatus ?? 'pending',
        created_at: s.createdAt ?? null,
      }));
      setStudents(list);
    } catch {
      setStudents([]);
    }
    setLoading(false);
  }

  async function handleApproval(student: StudentProfile, action: 'approve' | 'reject') {
    setProcessing(true);
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    try {
      if (action === 'approve') {
        await schoolService.approveStudent(student.id);
      } else {
        await schoolService.rejectStudent(student.id, 'Rejected by admin');
      }
      toast({
        title: action === 'approve' ? 'Student Approved' : 'Student Rejected',
        description: `${student.first_name} ${student.last_name} has been ${newStatus}.`,
      });
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, approval_status: newStatus } : s));
    } catch (err: any) {
      toast({ title: 'Action failed', description: err?.message ?? 'Request failed', variant: 'destructive' });
    }
    setProcessing(false);
    setActionDialog(null);
  }

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || s.first_name.toLowerCase().includes(q) || s.last_name.toLowerCase().includes(q) || 
           s.email.toLowerCase().includes(q) || (s.matric_number || '').toLowerCase().includes(q);
  });

  const pending = filtered.filter(s => s.approval_status === 'pending');
  const approved = filtered.filter(s => s.approval_status === 'approved');
  const rejected = filtered.filter(s => s.approval_status === 'rejected');

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'approved') return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">Approved</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">Rejected</Badge>;
    return <Badge className="bg-warning/10 text-warning border-0">Pending</Badge>;
  };

  const StudentRow = ({ student }: { student: StudentProfile }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-medium text-primary">{student.first_name[0]}{student.last_name[0]}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{student.first_name} {student.last_name}</p>
            <StatusBadge status={student.approval_status} />
          </div>
          <p className="text-sm text-muted-foreground">{student.matric_number || 'No matric'} • {student.email}</p>
          {student.department && <p className="text-xs text-muted-foreground">{student.department}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {student.approval_status === 'pending' && (
          <>
            <Button 
              size="sm" 
              variant="default"
              onClick={() => setActionDialog({ student, action: 'approve' })}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => setActionDialog({ student, action: 'reject' })}
            >
              <UserX className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        )}
        {student.approval_status === 'rejected' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setActionDialog({ student, action: 'approve' })}
          >
            <UserCheck className="h-4 w-4 mr-1" />
            Approve
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
            <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send Email</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage student accounts and approval requests</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCardSkeleton /><StatsCardSkeleton /><StatsCardSkeleton />
            </div>
            <div className="space-y-3">
              <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
                  <Clock className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.filter(s => s.approval_status === 'pending').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Approved Students</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.filter(s => s.approval_status === 'approved').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.filter(s => s.approval_status === 'rejected').length}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, matric number, or email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>

            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Pending ({pending.length})
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approved ({approved.length})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejected ({rejected.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-4">
                {pending.length === 0 ? (
                  <EmptyState 
                    icon={Clock} 
                    title="No pending requests" 
                    description="All student registration requests have been reviewed." 
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      {pending.map(s => <StudentRow key={s.id} student={s} />)}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="approved" className="mt-4">
                {approved.length === 0 ? (
                  <EmptyState 
                    icon={CheckCircle} 
                    title="No approved students" 
                    description="Approved students will appear here." 
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      {approved.map(s => <StudentRow key={s.id} student={s} />)}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="mt-4">
                {rejected.length === 0 ? (
                  <EmptyState 
                    icon={XCircle} 
                    title="No rejected students" 
                    description="Rejected student requests will appear here." 
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      {rejected.map(s => <StudentRow key={s.id} student={s} />)}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === 'approve' ? 'Approve Student' : 'Reject Student'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.action === 'approve' 
                ? `Are you sure you want to approve ${actionDialog?.student.first_name} ${actionDialog?.student.last_name}? They will gain full access to the student portal.`
                : `Are you sure you want to reject ${actionDialog?.student.first_name} ${actionDialog?.student.last_name}? They will not be able to access the platform.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)} disabled={processing}>Cancel</Button>
            <Button 
              variant={actionDialog?.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => actionDialog && handleApproval(actionDialog.student, actionDialog.action)}
              disabled={processing}
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {actionDialog?.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
