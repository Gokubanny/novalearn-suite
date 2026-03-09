import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ─── Schemas ────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    department: z.string().optional(),
    institution: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Helpers ────────────────────────────────────────────────
function getRoleRedirectPath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    student: '/dashboard/student',
    lecturer: '/dashboard/lecturer',
    admin: '/dashboard/admin',
    super_admin: '/dashboard/super-admin',
  };
  return paths[role];
}

const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
  { value: 'student', label: 'Student', icon: <GraduationCap className="h-5 w-5" /> },
  { value: 'lecturer', label: 'Lecturer', icon: <Users className="h-5 w-5" /> },
  { value: 'admin', label: 'Admin', icon: <Building2 className="h-5 w-5" /> },
];

// ─── Image config ───────────────────────────────────────────
const AUTH_IMAGES = {
  login: '/images/auth-signin.jpg',
  register: '/images/auth-signup.jpg',
};

const AUTH_COPY = {
  login: {
    heading: 'Welcome Back',
    sub: 'Sign in to continue your academic journey with NexfordEdu.',
  },
  register: {
    heading: 'Join NexfordEdu',
    sub: 'Create your account and unlock a world of academic excellence.',
  },
};

// ─── Main Component ─────────────────────────────────────────
export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const mode: 'login' | 'register' = isLogin ? 'login' : 'register';

  const { login, register: registerUser, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [displayMode, setDisplayMode] = useState<'login' | 'register'>(mode);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(getRoleRedirectPath(user.role), { replace: true });
    }
  }, [user, navigate]);

  // Sync displayMode when URL changes
  useEffect(() => {
    setDisplayMode(mode);
  }, [mode]);

  const handleSwitch = useCallback(
    (target: 'login' | 'register') => {
      if (target === displayMode) return;
      navigate(target === 'login' ? '/login' : '/register', { replace: true });
    },
    [displayMode, navigate]
  );

  return (
    <div className="min-h-screen flex bg-background overflow-hidden relative">
      {/* ── Mobile: Image as background ──────────────────── */}
      <div
        className="lg:hidden fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${AUTH_IMAGES[displayMode]})` }}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      {/* ── Desktop: Image Panel (fixed 50%) ─────────────── */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${AUTH_IMAGES[displayMode]})` }}
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

            {/* Overlay content */}
            <div className="absolute inset-0 flex flex-col justify-between p-12 text-white z-10">
              <Link
                to="/"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Home</span>
              </Link>

              <motion.div
                key={`copy-${displayMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="space-y-4 max-w-lg"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
                  {AUTH_COPY[displayMode].heading}
                </h1>
                <p className="text-lg text-white/75 leading-relaxed">
                  {AUTH_COPY[displayMode].sub}
                </p>
              </motion.div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-semibold text-lg tracking-wide">NexfordEdu</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Form Panel ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto relative z-10">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {displayMode === 'login' ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <LoginForm onSwitch={() => handleSwitch('register')} />
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <RegisterForm onSwitch={() => handleSwitch('login')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Login Form ─────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
    } else {
      toast({
        title: 'Login failed',
        description: result.error || 'Invalid email or password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden mb-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <div className="w-16 h-16 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
        <p className="text-muted-foreground mt-2">Enter your credentials to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email">Email Address</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@university.edu"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password')}
              className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary hover:underline font-semibold"
        >
          Create account
        </button>
      </p>
    </>
  );
}

// ─── Register Form ──────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: selectedRole,
      phone: data.phone,
      department: data.department,
      institution: data.institution,
    });
    if (result.success) {
      toast({
        title: 'Account created!',
        description: 'Please check your email to verify your account.',
      });
      navigate('/login');
    } else {
      toast({
        title: 'Registration failed',
        description: result.error || 'An account with this email already exists.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden mb-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
        <p className="text-muted-foreground mt-2">Fill in your details to get started</p>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <Label className="mb-3 block text-sm">I am a…</Label>
        <div className="grid grid-cols-3 gap-3">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                selectedRole === role.value
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40 hover:bg-muted/50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  selectedRole === role.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {role.icon}
              </div>
              <span
                className={`text-xs font-medium ${
                  selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {role.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reg-firstName">First Name</Label>
            <Input
              id="reg-firstName"
              placeholder="John"
              {...register('firstName')}
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-lastName">Last Name</Label>
            <Input
              id="reg-lastName"
              placeholder="Doe"
              {...register('lastName')}
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-email">Email Address</Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="john@university.edu"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-institution">Institution (Optional)</Label>
          <Input id="reg-institution" placeholder="University of Lagos" {...register('institution')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-password">Password</Label>
          <div className="relative">
            <Input
              id="reg-password"
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
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="reg-confirmPassword"
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
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-primary hover:underline font-semibold"
        >
          Sign in
        </button>
      </p>
    </>
  );
}
