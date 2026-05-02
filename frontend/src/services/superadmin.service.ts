import api from '../lib/api';

export const superAdminService = {
  getStats: () => api.get('/api/super-admin/stats'),
  getAllSchools: (params?: any) => api.get('/api/super-admin/schools', { params }),
  createSchool: (data: any) => api.post('/api/super-admin/schools', data),
  getSchool: (id: string) => api.get(`/api/super-admin/schools/${id}`),
  toggleSchoolStatus: (id: string) =>
    api.patch(`/api/super-admin/schools/${id}/toggle-status`),
  updateSubscription: (id: string, data: any) =>
    api.patch(`/api/super-admin/schools/${id}/subscription`, data),
  getAllUsers: (params?: any) => api.get('/api/super-admin/users', { params }),
};
