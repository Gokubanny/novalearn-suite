import { useState, useEffect } from 'react';
import {
  Home, Building2, Users, DollarSign, FileText, Newspaper, Tag, Settings,
  Search, PlusCircle, MoreHorizontal, CheckCircle, Clock, Loader2,
  ChevronLeft, ChevronRight, Check,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { superAdminService } from '@/services/superadmin.service';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { toast } from 'sonner';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: Home },
  { name: 'Schools',   href: '/dashboard/super-admin/institutions', icon: Building2 },
  { name: 'Revenue',   href: '/dashboard/super-admin/revenue',      icon: DollarSign },
  { name: 'Users',     href: '/dashboard/super-admin/users',        icon: Users },
  { name: 'Audit Log', href: '/dashboard/super-admin/audit',        icon: FileText },
  { name: 'Blog',      href: '/dashboard/super-admin/blog',         icon: Newspaper },
  { name: 'Pricing',   href: '/dashboard/super-admin/pricing',      icon: Tag },
  { name: 'Settings',  href: '/dashboard/super-admin/settings',     icon: Settings },
];

interface Institution {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  subscription_plan: string | null;
  state: string | null;
  created_at: string | null;
  profileCount: number;
  adminName: string;
  adminEmail: string;
}

// ── Step indicator ────────────────────────────────────────────────────────────
const STEP_LABELS = ['School Info', 'Admin Account', 'Plan'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-6">
      {STEP_LABELS.map((label, i) => {
        const num  = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                done   ? 'bg-primary border-primary text-primary-foreground'
                : active ? 'border-primary text-primary'
                : 'border-border text-muted-foreground'
              }`}>
                {done ? <Check className="h-3.5 w-3.5" /> : num}
              </div>
              <span className={`text-[10px] whitespace-nowrap ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {num < STEP_LABELS.length && (
              <div className={`flex-1 h-0.5 mx-2 mb-3 transition-colors ${done ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Default form state ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  // Step 1 — school
  name: '', code: '', address: '', state: '', country: 'Nigeria',
  phone: '', email: '', website: '',
  // Step 2 — admin
  adminFirstName: '', adminLastName: '', adminEmail: '', adminPassword: '',
  // Step 3 — plan
  plan: 'basic' as 'basic' | 'pro' | 'enterprise',
};

const PLAN_INFO = {
  basic:      { label: 'Basic',      students: 500,   lecturers: 50,   color: 'text-gray-600'   },
  pro:        { label: 'Pro',        students: 2000,  lecturers: 200,  color: 'text-blue-600'   },
  enterprise: { label: 'Enterprise', students: 10000, lecturers: 1000, color: 'text-purple-600' },
};

const NIGERIA_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];

// ── Form field ─────────────────────────────────────────────────────────────────
// Moved to module scope (outside AddSchoolDialog) so it's a stable component
// reference across renders. When it was defined inside AddSchoolDialog, every
// keystroke re-created this function, so React unmounted/remounted the
// underlying <input> on every character — hence losing focus after each one.
function Field({ label, value, error, onChange, type = 'text', placeholder = '', optional = false }: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{optional && <span className="text-muted-foreground ml-1 text-xs">(optional)</span>}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={error ? 'border-destructive' : ''}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Add School Dialog ─────────────────────────────────────────────────────────
function AddSchoolDialog({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  // Reset when opened
  useEffect(() => {
    if (open) { setStep(1); setForm(EMPTY_FORM); setErrors({}); }
  }, [open]);

  const set = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // ── Per-step validation ──────────────────────────────────────────────────
  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name    = 'School name is required';
    if (!form.code.trim())    e.code    = 'School code is required';
    if (!/^[A-Z0-9]{2,10}$/i.test(form.code.trim()))
                              e.code    = 'Code must be 2–10 letters/numbers';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.state.trim())   e.state   = 'State is required';
    if (!form.phone.trim())   e.phone   = 'Phone is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
                              e.email   = 'Valid school email is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (!form.adminFirstName.trim()) e.adminFirstName = 'First name is required';
    if (!form.adminLastName.trim())  e.adminLastName  = 'Last name is required';
    if (!form.adminEmail.trim() || !/\S+@\S+\.\S+/.test(form.adminEmail))
                                     e.adminEmail     = 'Valid email is required';
    if (form.adminPassword.length < 8) e.adminPassword = 'Password must be at least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      await superAdminService.createSchool({
        ...form,
        code: form.code.toUpperCase().trim(),
      });
      toast.success(`${form.name} created! Admin credentials sent to ${form.adminEmail}.`);
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create school. Check the details and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Institution</DialogTitle>
          <DialogDescription>
            Create a school and its admin account in one step.
          </DialogDescription>
        </DialogHeader>

        <StepIndicator current={step} />

        {/* ── Step 1: School Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="School Name" value={form.name} error={errors.name} onChange={v => set('name', v)} placeholder="University of Port Harcourt" />
              </div>
              <Field label="School Code" value={form.code} error={errors.code} onChange={v => set('code', v)} placeholder="UNIPH" />
              <div className="space-y-1.5">
                <Label>State</Label>
                <Select value={form.state} onValueChange={v => set('state', v)}>
                  <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {NIGERIA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
              </div>
              <div className="col-span-2">
                <Field label="Address" value={form.address} error={errors.address} onChange={v => set('address', v)} placeholder="PMB 5323, Port Harcourt" />
              </div>
              <Field label="Phone" value={form.phone} error={errors.phone} onChange={v => set('phone', v)} placeholder="+234 84 230 000" />
              <Field label="School Email" value={form.email} error={errors.email} onChange={v => set('email', v)} placeholder="info@uniph.edu.ng" />
              <div className="col-span-2">
                <Field label="Website" value={form.website} onChange={v => set('website', v)} placeholder="https://uniph.edu.ng" optional />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={nextStep}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Admin Account ── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              This person will be the school admin. They'll receive login credentials by email
              and can start setting up departments and approving staff immediately.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" value={form.adminFirstName} error={errors.adminFirstName} onChange={v => set('adminFirstName', v)} placeholder="Emeka" />
              <Field label="Last Name"  value={form.adminLastName}  error={errors.adminLastName}  onChange={v => set('adminLastName', v)}  placeholder="Johnson" />
              <div className="col-span-2">
                <Field label="Admin Email" value={form.adminEmail} error={errors.adminEmail} onChange={v => set('adminEmail', v)} placeholder="admin@uniph.edu.ng" />
              </div>
              <div className="col-span-2">
                <Field label="Temporary Password" value={form.adminPassword} error={errors.adminPassword} onChange={v => set('adminPassword', v)} type="password" placeholder="Min. 8 characters" />
                <p className="text-xs text-muted-foreground mt-1">
                  The admin should change this on first login.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-none">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={nextStep} className="flex-1">
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Plan ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg border p-4 space-y-1 text-sm">
              <p className="font-semibold">{form.name} <span className="font-mono text-muted-foreground text-xs ml-1">({form.code.toUpperCase()})</span></p>
              <p className="text-muted-foreground">{form.address}, {form.state}</p>
              <p className="text-muted-foreground">{form.email}</p>
              <div className="pt-1 border-t mt-2">
                <p className="font-medium">Admin: {form.adminFirstName} {form.adminLastName}</p>
                <p className="text-muted-foreground">{form.adminEmail}</p>
              </div>
            </div>

            {/* Plan picker */}
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PLAN_INFO) as Array<keyof typeof PLAN_INFO>).map(p => {
                  const info = PLAN_INFO[p];
                  const active = form.plan === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set('plan', p)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${info.color}`}>{info.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{info.students.toLocaleString()} students</p>
                      <p className="text-xs text-muted-foreground">{info.lecturers.toLocaleString()} lecturers</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} disabled={saving} className="flex-none">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={saving} className="flex-1">
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</>
                  : 'Create Institution'
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SuperAdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [addOpen, setAddOpen]           = useState(false);

  useEffect(() => { fetchInstitutions(); }, []);

  async function fetchInstitutions() {
    setLoading(true);
    try {
      const res = await superAdminService.getAllSchools({ limit: 100 });
      setInstitutions((res.data?.data ?? []).map((s: any) => ({
        id:                s._id ?? s.id,
        name:              s.name,
        code:              s.code,
        is_active:         s.isActive ?? true,
        subscription_plan: s.subscription?.plan ?? null,
        state:             s.state ?? null,
        created_at:        s.createdAt ?? null,
        profileCount:      (s.studentCount ?? 0) + (s.lecturerCount ?? 0),
        adminName:  s.admin ? `${s.admin.firstName} ${s.admin.lastName}` : '—',
        adminEmail: s.admin?.email ?? '—',
      })));
    } catch {
      setInstitutions([]);
    }
    setLoading(false);
  }

  async function handleToggleStatus(id: string, currentlyActive: boolean) {
    try {
      await superAdminService.toggleSchoolStatus(id);
      setInstitutions(prev => prev.map(i =>
        i.id === id ? { ...i, is_active: !currentlyActive } : i
      ));
      toast.success(`School ${currentlyActive ? 'suspended' : 'activated'}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update school status.');
    }
  }

  const filtered = institutions.filter(i => {
    const q = search.toLowerCase();
    return !q || i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q);
  });

  const planBadgeClass = (plan: string | null) => {
    if (plan === 'enterprise') return 'border-purple-300 text-purple-700';
    if (plan === 'pro')        return 'border-blue-300 text-blue-700';
    return '';
  };

  return (
    <DashboardLayout navItems={navItems} roleLabel="Super Admin" accentColor="hsl(0, 84%, 60%)">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Institutions</h1>
            <p className="text-muted-foreground">Manage registered institutions and onboard new ones</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" /> Add Institution
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle>
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code…"
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
          <EmptyState
            title="No institutions"
            description='No institutions found. Click "Add Institution" to onboard one.'
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Institutions ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filtered.map(inst => (
                <div key={inst.id} className="flex items-start justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{inst.name}</p>
                        <span className="font-mono text-xs text-muted-foreground">{inst.code}</span>
                        <Badge variant={inst.is_active ? 'default' : 'secondary'}>
                          {inst.is_active ? 'Active' : 'Suspended'}
                        </Badge>
                        <Badge variant="outline" className={planBadgeClass(inst.subscription_plan)}>
                          {inst.subscription_plan ?? 'basic'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{inst.state}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Admin: {inst.adminName} · {inst.adminEmail}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inst.profileCount} user{inst.profileCount !== 1 ? 's' : ''}
                        {inst.created_at && (
                          <> · Joined {new Date(inst.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</>
                        )}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem
                        className={inst.is_active ? 'text-destructive' : 'text-green-600'}
                        onClick={() => handleToggleStatus(inst.id, inst.is_active)}
                      >
                        {inst.is_active ? 'Suspend School' : 'Activate School'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <AddSchoolDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={fetchInstitutions}
      />
    </DashboardLayout>
  );
}