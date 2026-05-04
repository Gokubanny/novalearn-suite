import api from '../lib/api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  registerStudent: (data: any) =>
    api.post('/api/auth/register/student', data),
  registerLecturer: (data: any) =>
    api.post('/api/auth/register/lecturer', data),
  getMe: () => api.get('/api/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.patch(`/api/auth/reset-password/${token}`, { password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/api/auth/change-password', { currentPassword, newPassword }),
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch('/api/auth/update-profile', data),
};
