import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export type Role = 'super_admin' | 'school_admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  school?: string;
  profileImage?: string;
  approvalStatus?: string;
  [key: string]: any;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/api/auth/login', { email, password });
          const payload = response.data;
          const token = payload.token ?? payload.data?.token;
          const user: User = payload.data?.user ?? payload.user ?? payload.data;
          if (!token || !user) {
            throw new Error('Invalid login response from server');
          }
          localStorage.setItem('nexford_token', token);
          localStorage.setItem('nexford_user', JSON.stringify(user));
          set({ user, token, isAuthenticated: true, isLoading: false });
          return user;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        localStorage.removeItem('nexford_token');
        localStorage.removeItem('nexford_user');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
      },
      setUser: (user) => set({ user }),
      hydrate: () => {
        const token = localStorage.getItem('nexford_token');
        const userRaw = localStorage.getItem('nexford_user');
        if (token && userRaw) {
          try {
            set({ user: JSON.parse(userRaw), token, isAuthenticated: true });
          } catch {
            /* ignore */
          }
        }
      },
    }),
    { name: 'nexford_auth' }
  )
);
