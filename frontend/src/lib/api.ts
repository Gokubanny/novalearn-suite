import axios from 'axios';

const BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||
  'https://nexford-backend.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach token to every request ─────────────────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('nexford_token');
  if (token && config.headers) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Handle 401 responses ──────────────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    const url = error.config?.url ?? '';

    // ← KEY FIX: Never clear storage / redirect for auth endpoints.
    // Login, register, and forgot-password can all legitimately return 401
    // (wrong password, unverified account, etc.) and should NOT wipe the
    // user's existing session or redirect them to /login.
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('nexford_token');
      localStorage.removeItem('nexford_user');
      // Only redirect if not already heading to login
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Always surface the backend error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;