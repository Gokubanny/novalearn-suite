import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Loader2, ArrowLeft, GraduationCap, Users,
  Building2, Search, CheckCircle2, ChevronLeft, ChevronRight, Check, Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, RegisterRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { schoolService } from '@/services/school.service';

// ── Validation ────────────────────────────────────────────────────────────────
const NAME_RE = /^[A-Za-z][A-Za-z'’\- ]*$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,19}$/;

const makeRegisterSchema = (role: 'student' | 'lecturer') =>
  z.object({
    firstName: z.string().trim()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be under 50 characters')
      .regex(NAME_RE, 'Use letters only (hyphens and apostrophes allowed)'),
    lastName: z.string().trim()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be under 50 characters')
      .regex(NAME_RE, 'Use letters only (hyphens and apostrophes allowed)'),
    email: z.string().trim()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address, e.g. john@example.com'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z.string().trim()
      .min(1, 'Phone number is required')
      .regex(PHONE_RE, 'Enter a valid phone number, e.g. +2348012345678'),
    // Student-only
    level: z.string().optional(),
    // Lecturer-only
    title: z.string().optional(),
    qualification: z.string().trim().optional(),
    specialisation: z.string().trim().optional(),
  }).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Passwords don't match", path: ['confirmPassword'] });
    }
    if (role === 'student') {
      if (!data.level) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select your level', path: ['level'] });
      }
    }
    if (role === 'lecturer') {
      if (!data.title) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Please select a title', path: ['title'] });
      }
      if (!data.qualification || data.qualification.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Qualification is required', path: ['qualification'] });
      }
    }
  });

type RegisterFormData = z.infer<ReturnType<typeof makeRegisterSchema>>;


interface SchoolOption { id: string; name: string; code: string; logo?: string; }
interface DepartmentOption { id: string; name: string; code: string; }

const ROLES: { value: RegisterRole; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'student',  label: 'Student',  icon: <GraduationCap className="h-6 w-6" />, color: 'hsl(221, 83%, 53%)' },
  { value: 'lecturer', label: 'Lecturer', icon: <Users className="h-6 w-6" />,         color: 'hsl(142, 71%, 45%)' },
];

const LEVELS = [100, 200, 300, 400, 500];
const TITLES = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Engr.'];

const STEP_LABELS = ['Role', 'School', 'Department', 'Details'];

// ── Step progress indicator ───────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center mb-8">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const isActive = num === current;
        const isDone = num < current;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                isDone ? 'bg-primary border-primary text-primary-foreground'
                : isActive ? 'border-primary text-primary'
                : 'border-border text-muted-foreground'
              }`}>
                {isDone ? <Check className="h-4 w-4" /> : num}
              </div>
              <span className={`text-[10px] ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </div>
            {num < STEP_LABELS.length && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors ${isDone ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<RegisterRole>('student');

  // Step 2 — school search
  const [schoolQuery, setSchoolQuery]       = useState('');
  const [schoolResults, setSchoolResults]   = useState<SchoolOption[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(null);
  const [searchingSchools, setSearchingSchools] = useState(false);

  // Step 3 — department
  const [departments, setDepartments]                 = useState<DepartmentOption[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [loadingDepartments, setLoadingDepartments]    = useState(false);

  const schema = useMemo(() => makeRegisterSchema(role as 'student' | 'lecturer'), [role]);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema), mode: 'onBlur' });


  // ── Debounced school search ──────────────────────────────────────────────
  useEffect(() => {
    if (schoolQuery.trim().length < 2) {
      setSchoolResults([]);
      return;
    }
    setSearchingSchools(true);
    const timer = setTimeout(async () => {
      try {
        const res = await schoolService.searchSchools(schoolQuery.trim());
        setSchoolResults(res.data?.data ?? []);
      } catch {
        setSchoolResults([]);
      } finally {
        setSearchingSchools(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [schoolQuery]);

  // ── Fetch departments once a school is selected ──────────────────────────
  useEffect(() => {
    if (!selectedSchool) return;
    setLoadingDepartments(true);
    setSelectedDepartmentId('');
    schoolService.getPublicDepartments(selectedSchool.id)
      .then(res => setDepartments(res.data?.data ?? []))
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepartments(false));
  }, [selectedSchool]);

  // ── Final submit ──────────────────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormData) => {
    if (!selectedSchool) {
      toast({ title: 'Select your school', description: 'Please go back and choose your school.', variant: 'destructive' });
      setStep(2);
      return;
    }
    if (!selectedDepartmentId) {
      toast({ title: 'Select your department', description: 'Please go back and choose your department.', variant: 'destructive' });
      setStep(3);
      return;
    }


    const result = await registerUser({
      role,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      schoolCode: selectedSchool.code,
      departmentId: selectedDepartmentId,
      level: role === 'student' ? Number(data.level) : undefined,
      title: role === 'lecturer' ? data.title : undefined,
      qualification: role === 'lecturer' ? data.qualification : undefined,
      specialisation: role === 'lecturer' ? data.specialisation : undefined,
    });

    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Your registration is pending approval from your institution.',
      });
      navigate('/login');
    } else {
      toast({
        title: 'Registration failed',
        description: result.error || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const selectedDepartment = departments.find(d => d.id === selectedDepartmentId);

  // ── Live password requirements ────────────────────────────────────────────
  const passwordValue = watch('password') || '';
  const passwordRequirements = [
    { label: 'At least 8 characters', met: passwordValue.length >= 8 },
    { label: 'At least one letter', met: /[A-Za-z]/.test(passwordValue) },
    { label: 'At least one number', met: /[0-9]/.test(passwordValue) },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-primary/80">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h1 className="text-4xl font-bold mb-4">Join NexfordEdu</h1>
              <p className="text-xl text-white/80 max-w-md">
                Create your account and start your journey towards academic excellence.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-sm">✓</span></div>
                <span>Access to all learning resources</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-sm">✓</span></div>
                <span>Track your progress in real-time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-sm">✓</span></div>
                <span>Connect with educators and peers</span>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-semibold text-lg">NexfordEdu</span>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
        <div className="absolute top-20 -right-10 w-40 h-40 rounded-full bg-white/5" />
      </div>

      {/* ── Right Panel — Multi-step form ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          <StepIndicator current={step} />

          <AnimatePresence mode="wait">

            {/* ── Step 1: Role ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Create your account</h2>
                  <p className="text-muted-foreground mt-2">First, tell us who you are</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                        role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: role === r.value ? r.color : 'hsl(var(--muted))' }}
                      >
                        <div className={role === r.value ? 'text-white' : 'text-muted-foreground'}>{r.icon}</div>
                      </div>
                      <span className={`font-medium ${role === r.value ? 'text-primary' : 'text-muted-foreground'}`}>
                        {r.label}
                      </span>
                    </button>
                  ))}
                </div>

                <Button type="button" className="w-full" onClick={() => setStep(2)}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ── Step 2: Find school ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Find your school</h2>
                  <p className="text-muted-foreground mt-2">Search for your institution by name</p>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. University of Port Harcourt"
                    className="pl-9"
                    value={schoolQuery}
                    onChange={e => { setSchoolQuery(e.target.value); setSelectedSchool(null); }}
                    autoFocus
                  />
                </div>

                {searchingSchools && (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!searchingSchools && schoolQuery.trim().length >= 2 && schoolResults.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No schools found for "{schoolQuery}". Check the spelling or contact your institution.
                  </p>
                )}

                {!searchingSchools && schoolQuery.trim().length < 2 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Type at least 2 characters to search.
                  </p>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {schoolResults.map(school => (
                    <button
                      key={school.id}
                      type="button"
                      onClick={() => setSelectedSchool(school)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                        selectedSchool?.id === school.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{school.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{school.code}</p>
                      </div>
                      {selectedSchool?.id === school.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button type="button" className="flex-1" disabled={!selectedSchool} onClick={() => setStep(3)}>
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Department ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Select your department</h2>
                  <p className="text-muted-foreground mt-2">
                    Departments at <span className="font-medium text-foreground">{selectedSchool?.name}</span>
                  </p>
                </div>

                {loadingDepartments ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">
                    No departments found for this school yet. Please contact your institution's admin.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {departments.map(dept => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setSelectedDepartmentId(dept.id)}
                        className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          selectedDepartmentId === dept.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">{dept.code}</p>
                        </div>
                        {selectedDepartmentId === dept.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button type="button" className="flex-1" disabled={!selectedDepartmentId} onClick={() => setStep(4)}>
                    Continue <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Personal + role-specific details ── */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">Almost done</h2>
                  <p className="text-muted-foreground mt-2">
                    {selectedSchool?.name} · {selectedDepartment?.name}
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" {...register('firstName')} className={errors.firstName ? 'border-destructive' : ''} />
                      {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" {...register('lastName')} className={errors.lastName ? 'border-destructive' : ''} />
                      {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john@example.com" {...register('email')} className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+2348012345678" {...register('phone')} className={errors.phone ? 'border-destructive' : ''} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>

                  {role === 'student' ? (
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select value={watch('level')} onValueChange={v => setValue('level', v, { shouldValidate: true })}>
                        <SelectTrigger className={errors.level ? 'border-destructive' : ''}><SelectValue placeholder="Select level" /></SelectTrigger>
                        <SelectContent>
                          {LEVELS.map(l => <SelectItem key={l} value={String(l)}>{l} Level</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
                      <p className="text-xs text-muted-foreground">
                        Your matric number will be assigned automatically based on your department.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Select value={watch('title')} onValueChange={v => setValue('title', v, { shouldValidate: true })}>
                            <SelectTrigger className={errors.title ? 'border-destructive' : ''}><SelectValue placeholder="Select title" /></SelectTrigger>
                            <SelectContent>
                              {TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualification">Qualification</Label>
                          <Input id="qualification" placeholder="e.g. PhD Computer Science" {...register('qualification')} className={errors.qualification ? 'border-destructive' : ''} />
                          {errors.qualification && <p className="text-xs text-destructive">{errors.qualification.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialisation">Specialisation (Optional)</Label>
                        <Input id="specialisation" placeholder="e.g. Machine Learning" {...register('specialisation')} />
                      </div>
                    </>
                  )}


                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        {...register('password')}
                        className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <ul className="space-y-1 pt-1">
                      {passwordRequirements.map(req => (
                        <li
                          key={req.label}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            req.met ? 'text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          {req.met ? <Check className="h-3 w-3 flex-shrink-0" /> : <Circle className="h-3 w-3 flex-shrink-0" />}
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        {...register('confirmPassword')}
                        className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(3)} disabled={isLoading}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}