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

interface RegisterData {
  role: RegisterRole;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  schoolCode: string;
  departmentId: string;
  level?: number;
  matricNumber?: string;
  title?: string;
  qualification?: string;
  specialisation?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_TOKEN = 'nexford_token';
const STORAGE_USER  = 'nexford_user';

function normalizeRole(role: string | undefined): UserRole {
  if (role === 'school_admin') return 'admin';
  if (
    role === 'super_admin' || role === 'admin' ||
    role === 'lecturer'    || role === 'student'
  ) return role;
  return 'student';
}

function mapServerUser(raw: any): UserProfile {
  return {
    id:            raw.id          ?? raw._id        ?? '',
    userId:        raw.id          ?? raw._id        ?? '',
    email:         raw.email       ?? '',
    role:          normalizeRole(raw.role),
    firstName:     raw.firstName   ?? raw.first_name ?? '',
    lastName:      raw.lastName    ?? raw.last_name  ?? '',
    phone:         raw.phone,
    avatar:        raw.profileImage ?? raw.avatar_url,
    department:    raw.department,
    institution:   raw.school?.name ?? (typeof raw.school === 'string' ? undefined : raw.school),
    institutionId: typeof raw.school === 'string'
      ? raw.school
      : raw.school?._id ?? raw.school?.id,
    matricNumber:  raw.matricNumber ?? raw.matric_number,
    staffId:       raw.staffId     ?? raw.staff_id,
    approvalStatus: raw.approvalStatus ?? raw.status ?? 'approved',
    createdAt:     raw.createdAt   ?? new Date().toISOString(),
  };
}

function clearStorage() {
  localStorage.removeItem(STORAGE_TOKEN);
  localStorage.removeItem(STORAGE_USER);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── On mount: restore session from localStorage then verify the token ────────
  useEffect(() => {
    const token   = localStorage.getItem(STORAGE_TOKEN);
    const userRaw = localStorage.getItem(STORAGE_USER);

    if (!token || !userRaw) {
      setIsLoading(false);
      return;
    }

    // Restore user from cache immediately so the UI doesn't flash a login page
    try {
      setUser(mapServerUser(JSON.parse(userRaw)));
    } catch {
      clearStorage();
      setIsLoading(false);
      return;
    }

    // Then verify the token is still valid against the server
    // This catches expired tokens that are still in localStorage
    authService.getMe()
      .then(res => {
        const data = res.data?.data;
        if (data?.user) {
          // Merge server-fresh user data
          const merged = { ...data.user, ...data.profile };
          setUser(mapServerUser(merged));
          localStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Token is invalid or expired — clear everything
        clearStorage();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);

      // Backend shape: { success, message, token, data: { id, firstName, ... } }
      const payload = response.data as any;
      const token   = payload.token;       // token is at root level
      const rawUser = payload.data;        // user fields are in data

      if (!token || !rawUser) {
        setIsLoading(false);
        return { success: false, error: 'Invalid response from server. Please try again.' };
      }

      localStorage.setItem(STORAGE_TOKEN, token);
      localStorage.setItem(STORAGE_USER, JSON.stringify(rawUser));
      setUser(mapServerUser(rawUser));
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message ?? 'Login failed. Check your credentials.' };
    }
  };

  // ── Register ──────────────────────────────────────────────────────────────────
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
      return { success: false, error: err?.message ?? 'Registration failed.' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = async () => {
    clearStorage();
    setUser(null);
  };

  // ── Reset password ────────────────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message ?? 'Could not send reset email.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session: null, isLoading, login, register, logout, resetPassword }}
    >
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