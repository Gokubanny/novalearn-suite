import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/auth.service';

export type UserRole = 'student' | 'lecturer' | 'admin' | 'super_admin';
export type RegisterRole = 'student' | 'lecturer';

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  department?: string;
  institution?: string;
  institutionId?: string;
  matricNumber?: string;
  staffId?: string;
  approvalStatus: string;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

// ── Registration payload — fields vary by role ────────────────────────────────
interface RegisterData {
  role: RegisterRole;

  // Common
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;

  // Picked via the school-search / department steps
  schoolCode: string;
  departmentId: string;

  // Student-only
  level?: number;
  matricNumber?: string;

  // Lecturer-only
  title?: string;
  qualification?: string;
  specialisation?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN = 'nexford_token';
const STORAGE_USER = 'nexford_user';

// Backend uses 'school_admin'; the existing frontend uses 'admin' everywhere.
function normalizeRole(role: string | undefined): UserRole {
  if (role === 'school_admin') return 'admin';
  if (role === 'super_admin' || role === 'admin' || role === 'lecturer' || role === 'student') {
    return role;
  }
  return 'student';
}

function mapServerUser(raw: any): UserProfile {
  return {
    id: raw.id ?? raw._id ?? '',
    userId: raw.id ?? raw._id ?? '',
    email: raw.email ?? '',
    role: normalizeRole(raw.role),
    firstName: raw.firstName ?? raw.first_name ?? '',
    lastName: raw.lastName ?? raw.last_name ?? '',
    phone: raw.phone,
    avatar: raw.profileImage ?? raw.avatar_url,
    department: raw.department,
    institution: raw.school?.name ?? raw.school,
    institutionId: typeof raw.school === 'string' ? raw.school : raw.school?.id ?? raw.school?._id,
    matricNumber: raw.matricNumber ?? raw.matric_number,
    staffId: raw.staffId ?? raw.staff_id,
    approvalStatus: raw.approvalStatus ?? raw.status ?? 'approved',
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN);
    const userRaw = localStorage.getItem(STORAGE_USER);
    if (token && userRaw) {
      try {
        setUser(mapServerUser(JSON.parse(userRaw)));
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const payload: any = response.data;
      const token = payload.token ?? payload.data?.token;
      const rawUser = payload.data?.user ?? payload.user ?? payload.data;
      if (!token || !rawUser) {
        setIsLoading(false);
        return { success: false, error: 'Invalid response from server' };
      }
      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(rawUser));
      setUser(mapServerUser(rawUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message ?? 'Login failed' };
    }
  };

  // ── Register — builds the correct payload shape per role ───────────────────
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      if (data.role === 'lecturer') {
        await authService.registerLecturer({
          firstName:      data.firstName,
          lastName:       data.lastName,
          email:          data.email,
          password:       data.password,
          phone:          data.phone,
          schoolCode:     data.schoolCode,
          departmentId:   data.departmentId,
          title:          data.title,
          qualification:  data.qualification,
          specialisation: data.specialisation,
        });
      } else {
        await authService.registerStudent({
          firstName:    data.firstName,
          lastName:     data.lastName,
          email:        data.email,
          password:     data.password,
          phone:        data.phone,
          schoolCode:   data.schoolCode,
          departmentId: data.departmentId,
          level:        data.level,
          matricNumber: data.matricNumber,
        });
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message ?? 'Registration failed' };
    }
  };

  const logout = async () => {
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Could not send reset email' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session: null, isLoading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}