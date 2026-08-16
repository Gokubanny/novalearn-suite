import { useState, useEffect } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Search, PlusCircle, MoreHorizontal, Pencil, Trash2, Loader2, Bell, Calendar, Hash
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { schoolService } from '@/services/school.service';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/dashboard/EmptyState';
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

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headId: string | null;
  headName: string | null;
  isActive: boolean;
}

interface DeptForm {
  name: string;
  code: string;
  description: string;
  headId: string | null;
}

interface LecturerOption {
  userId: string;
  name: string;
  departmentId: string | null;
}

const EMPTY_FORM: DeptForm = { name: '', code: '', description: '', headId: null };

export default function DepartmentManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<DeptForm>({ ...EMPTY_FORM });
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [editForm, setEditForm] = useState<DeptForm>({ ...EMPTY_FORM });
  const [editing, setEditing] = useState(false);

  // Deactivate confirm
  const [deactivateTarget, setDeactivateTarget] = useState<Department | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchDepartments();
    fetchLecturers();
  }, [user]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await schoolService.getDepartments();
      const list: any[] = res.data?.data ?? [];
      setDepartments(
        list.map((d) => ({
          id: d._id ?? d.id,
          name: d.name,
          code: d.code,
          description: d.description ?? '',
          headId: d.head?._id ?? d.head ?? null,
          headName: d.head
            ? `${d.head.firstName ?? ''} ${d.head.lastName ?? ''}`.trim() || null
            : null,
          isActive: d.isActive ?? true,
        }))
      );
    } catch (err: any) {
      toast({
        title: 'Failed to load departments',
        description: err?.message,
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  // Lecturers list is used only to populate the HOD dropdown — non-critical,
  // so a failure here shouldn't block the page or show an error toast.
  const fetchLecturers = async () => {
    try {
      const res = await schoolService.getAllLecturers();
      const list: any[] = res.data?.data ?? [];
      setLecturers(
        list
          .filter((l) => l.approvalStatus === 'approved')
          .map((l) => ({
            userId: l.user?._id,
            name: `${l.user?.firstName ?? ''} ${l.user?.lastName ?? ''}`.trim(),
            departmentId: l.department?._id ?? l.department ?? null,
          }))
          .filter((l) => l.userId && l.name)
      );
    } catch {
      // Silent — the Edit dialog just shows an empty HOD list if this fails.
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.code.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Name and Code are required.',
        variant: 'destructive',
      });
      return;
    }
    setCreating(true);
    try {
      await schoolService.createDepartment({
        name: createForm.name.trim(),
        code: createForm.code.trim().toUpperCase(),
        description: createForm.description.trim(),
      });
      toast({ title: 'Department created successfully!' });
      setCreateOpen(false);
      setCreateForm({ ...EMPTY_FORM });
      fetchDepartments();
    } catch (err: any) {
      toast({
        title: 'Failed to create department',
        description: err?.message,
        variant: 'destructive',
      });
    }
    setCreating(false);
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (dept: Department) => {
    setEditTarget(dept);
    setEditForm({
      name: dept.name,
      code: dept.code,
      description: dept.description,
      headId: dept.headId,
    });
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editForm.name.trim() || !editForm.code.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Name and Code are required.',
        variant: 'destructive',
      });
      return;
    }
    setEditing(true);
    try {
      await schoolService.updateDepartment(editTarget.id, {
        name: editForm.name.trim(),
        code: editForm.code.trim().toUpperCase(),
        description: editForm.description.trim(),
        head: editForm.headId,
      });
      toast({ title: 'Department updated!' });
      setEditTarget(null);
      fetchDepartments();
    } catch (err: any) {
      toast({
        title: 'Failed to update',
        description: err?.message,
        variant: 'destructive',
      });
    }
    setEditing(false);
  };

  // ── Deactivate ────────────────────────────────────────────────────────────
  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    try {
      await schoolService.deleteDepartment(deactivateTarget.id);
      toast({ title: `"${deactivateTarget.name}" has been deactivated.` });
      setDeactivateTarget(null);
      fetchDepartments();
    } catch (err: any) {
      toast({
        title: 'Failed to deactivate',
        description: err?.message,
        variant: 'destructive',
      });
    }
    setDeactivating(false);
  };

  const filtered = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  const activeDepts = departments.filter((d) => d.isActive);

  const eligibleLecturers = editTarget
    ? lecturers.filter((l) => l.departmentId === editTarget.id)
    : [];

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Department Management</h1>
            <p className="text-muted-foreground">
              Organise and manage academic departments
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Departments
              </CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <Building2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDepts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                With HOD Assigned
              </CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {departments.filter((d) => d.headName).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 && departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments yet"
            description="Add your first department to start organising your institution."
            actionLabel="Add Department"
            onAction={() => setCreateOpen(true)}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No departments match"
            description={`No department found for "${search}".`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((dept) => (
              <Card key={dept.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{dept.code}</span>
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base leading-tight">{dept.name}</CardTitle>
                        {dept.headName && (
                          <CardDescription className="text-xs mt-0.5">
                            HOD: {dept.headName}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(dept)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeactivateTarget(dept)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dept.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => openEdit(dept)}
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!creating) setCreateOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Create a new academic department for your institution.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input
                placeholder="e.g. Computer Science"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department Code *</Label>
              <Input
                placeholder="e.g. CSC"
                value={createForm.code}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Brief description of the department..."
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => { if (!editing && !v) setEditTarget(null); }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Department Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Department Code *</Label>
              <Input
                value={editForm.code}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase(),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Head of Department</Label>
              <Select
                value={editForm.headId ?? 'none'}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, headId: v === 'none' ? null : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No HOD assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No HOD assigned</SelectItem>
                  {eligibleLecturers.map((l) => (
                    <SelectItem key={l.userId} value={l.userId}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eligibleLecturers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No approved lecturers in this department yet — add one before assigning a HOD.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={editing}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={editing}>
              {editing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Confirm ── */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(v) => { if (!deactivating && !v) setDeactivateTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate{' '}
              <span className="font-semibold">{deactivateTarget?.name}</span>? This will
              hide it from the platform but not delete any existing data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}