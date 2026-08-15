import { useState, useEffect } from 'react';
import {
  Home, Users, GraduationCap, Building2, CreditCard, BarChart3, Settings,
  Hash, Save, RotateCcw, Info, Bell, Calendar, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { schoolService } from '@/services/school.service';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/dashboard/EmptyState';

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

interface DeptFormat {
  id: string;
  name: string;
  code: string;
  matricPrefix: string | null;
  matricSeparator: string;
  matricYearFormat: 'full' | 'short';
  matricSequenceDigits: number;
  matricSequence: number;
}

interface EditForm {
  matricPrefix: string;
  matricSeparator: string;
  matricYearFormat: 'full' | 'short';
  matricSequenceDigits: string;
}

const DEFAULT_FORM: EditForm = {
  matricPrefix: '', matricSeparator: '/', matricYearFormat: 'full', matricSequenceDigits: '3',
};

function buildExample(dept: DeptFormat, schoolCode: string, override?: Partial<EditForm>) {
  const prefix = (override?.matricPrefix ?? dept.matricPrefix ?? schoolCode ?? 'SCH').toUpperCase() || (schoolCode || 'SCH').toUpperCase();
  const separator = override?.matricSeparator ?? dept.matricSeparator;
  const yearFormat = override?.matricYearFormat ?? dept.matricYearFormat;
  const digits = Number(override?.matricSequenceDigits ?? dept.matricSequenceDigits);
  const year = yearFormat === 'short' ? String(new Date().getFullYear()).slice(-2) : String(new Date().getFullYear());
  const seq = '1'.padStart(digits, '0');
  return `${prefix}${separator}${dept.code}${separator}${year}${separator}${seq}`;
}

export default function MatricConfigPage() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<DeptFormat[]>([]);
  const [schoolCode, setSchoolCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [deptRes, profileRes] = await Promise.all([
        schoolService.getDepartments(),
        schoolService.getProfile(),
      ]);
      setSchoolCode(profileRes.data?.data?.code ?? '');
      setDepartments((deptRes.data?.data ?? []).map((d: any) => ({
        id: d._id ?? d.id,
        name: d.name,
        code: d.code,
        matricPrefix: d.matricPrefix ?? null,
        matricSeparator: d.matricSeparator ?? '/',
        matricYearFormat: d.matricYearFormat ?? 'full',
        matricSequenceDigits: d.matricSequenceDigits ?? 3,
        matricSequence: d.matricSequence ?? 0,
      })));
    } catch (err: any) {
      toast({ title: 'Failed to load departments', description: err?.message, variant: 'destructive' });
      setDepartments([]);
    }
    setLoading(false);
  }

  function openEdit(dept: DeptFormat) {
    setEditingId(dept.id);
    setEditForm({
      matricPrefix: dept.matricPrefix ?? '',
      matricSeparator: dept.matricSeparator,
      matricYearFormat: dept.matricYearFormat,
      matricSequenceDigits: String(dept.matricSequenceDigits),
    });
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      await schoolService.updateDepartment(id, {
        matricPrefix: editForm.matricPrefix.trim() || null,
        matricSeparator: editForm.matricSeparator,
        matricYearFormat: editForm.matricYearFormat,
        matricSequenceDigits: Number(editForm.matricSequenceDigits),
      });
      toast({ title: 'Format updated' });
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Failed to save', description: err?.message, variant: 'destructive' });
    }
    setSaving(false);
  }

  async function handleReset(id: string) {
    setSaving(true);
    try {
      await schoolService.updateDepartment(id, {
        matricPrefix: null,
        matricSeparator: '/',
        matricYearFormat: 'full',
        matricSequenceDigits: 3,
      });
      toast({ title: 'Reset to default format' });
      if (editingId === id) setEditingId(null);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Failed to reset', description: err?.message, variant: 'destructive' });
    }
    setSaving(false);
  }

  return (
    <DashboardLayout navItems={navItems} roleLabel="Admin Portal" accentColor="hsl(262, 83%, 58%)">
      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Dashboard / <span className="text-foreground font-medium">Matriculation Number Configuration</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Matriculation Number Format</h1>
          <p className="text-muted-foreground">Configure the matric number style for each department</p>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 pt-4">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">How Matric Numbers Work</p>
              <p className="text-sm text-muted-foreground">
                Each department has a format: <strong>PREFIX/DEPT_CODE/YEAR/SEQUENCE</strong>. A prefix left
                blank uses your school's own code ({schoolCode || '—'}). Students are assigned the next
                number in the sequence automatically the moment they register — the sequence resets to 001
                at the start of each new academic session.
              </p>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : departments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No departments yet"
            description="Matric formats are configured per department — add a department first."
            actionLabel="Go to Departments"
            onAction={() => { window.location.href = '/dashboard/admin/departments'; }}
          />
        ) : (
          <div className="space-y-4">
            {departments.map((dept) => {
              const isEditing = editingId === dept.id;
              const previewDept = isEditing ? buildExample(dept, schoolCode, editForm) : buildExample(dept, schoolCode);
              return (
                <Card key={dept.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{dept.code}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{dept.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Department Code: {dept.code} · Last assigned: {String(dept.matricSequence).padStart(dept.matricSequenceDigits, '0')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Preview</p>
                          <Badge variant="outline" className="font-mono text-sm px-3 py-1">{previewDept}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => isEditing ? setEditingId(null) : openEdit(dept)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            disabled={saving}
                            onClick={() => handleReset(dept.id)}
                            title="Reset to default format"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-6 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-xs">Prefix</Label>
                          <Input
                            value={editForm.matricPrefix}
                            onChange={e => setEditForm(f => ({ ...f, matricPrefix: e.target.value }))}
                            placeholder={schoolCode || 'School code'}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Separator</Label>
                          <Select value={editForm.matricSeparator} onValueChange={v => setEditForm(f => ({ ...f, matricSeparator: v }))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="/">/</SelectItem>
                              <SelectItem value="-">-</SelectItem>
                              <SelectItem value=".">.</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Year Format</Label>
                          <Select value={editForm.matricYearFormat} onValueChange={v => setEditForm(f => ({ ...f, matricYearFormat: v as 'full' | 'short' }))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full (2026)</SelectItem>
                              <SelectItem value="short">Short (26)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Sequence Digits</Label>
                          <Select value={editForm.matricSequenceDigits} onValueChange={v => setEditForm(f => ({ ...f, matricSequenceDigits: v }))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 digits (001)</SelectItem>
                              <SelectItem value="4">4 digits (0001)</SelectItem>
                              <SelectItem value="5">5 digits (00001)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <Button size="sm" disabled={saving} onClick={() => handleSave(dept.id)}>
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}