import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'lecturer' | 'admin' | 'super_admin';

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
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  department?: string;
  institution?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (authUser: User): Promise<UserProfile | null> => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      if (!profile) return null;

      return {
        id: profile.id,
        userId: authUser.id,
        email: profile.email,
        role: (roleData?.role as UserRole) || 'student',
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone || undefined,
        avatar: profile.avatar_url || undefined,
        department: profile.department || undefined,
        institutionId: profile.institution_id || undefined,
        matricNumber: profile.matric_number || undefined,
        staffId: profile.staff_id || undefined,
        approvalStatus: (profile as any).approval_status || 'approved',
        createdAt: profile.created_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const profile = await fetchUserProfile(newSession.user);
            setUser(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user).then((profile) => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          phone: data.phone,
          department: data.department,
        },
      },
    });

    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout, resetPassword }}>
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
