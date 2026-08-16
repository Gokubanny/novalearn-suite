import api from '../lib/api';

export const schoolService = {

  searchSchools: (query: string) =>
    api.get('/api/auth/public/search', { params: { q: query } }),

  getPublicDepartments: (schoolId: string) =>
    api.get(`/api/auth/public/${schoolId}/departments`),

  // ── Authenticated ──────────────────────────────────────────────────────────
  getStats: () => api.get('/api/school/stats'),
  getAttendanceAnalytics: () => api.get('/api/school/attendance-analytics'),
  getDepartmentAttendanceAnalytics: (departmentId: string) =>
    api.get(`/api/school/attendance-analytics/departments/${departmentId}`),
  getProfile: () => api.get('/api/school/profile'),
  updateProfile: (data: any) => api.patch('/api/school/profile', data),
  uploadLogo: (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/api/school/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createDepartment: (data: any) => api.post('/api/school/departments', data),
  getDepartments: () => api.get('/api/school/departments'),
  updateDepartment: (id: string, data: any) =>
    api.patch(`/api/school/departments/${id}`, data),
  deleteDepartment: (id: string) =>
    api.delete(`/api/school/departments/${id}`),
  getPendingStudents: () => api.get('/api/school/students/pending'),
  getAllStudents: (params?: any) => api.get('/api/school/students', { params }),
  getStudentProfile: (studentId: string) =>
    api.get(`/api/school/students/${studentId}/profile`),
  approveStudent: (id: string) => api.patch(`/api/school/students/${id}/approve`),
  rejectStudent: (id: string, reason: string) =>
    api.patch(`/api/school/students/${id}/reject`, { reason }),
  suspendStudent: (id: string) => api.patch(`/api/school/students/${id}/suspend`),
  getPendingLecturers: () => api.get('/api/school/lecturers/pending'),
  getAllLecturers: () => api.get('/api/school/lecturers'),
  getLecturerProfile: (lecturerId: string) =>
    api.get(`/api/school/lecturers/${lecturerId}/profile`),
  approveLecturer: (id: string) => api.patch(`/api/school/lecturers/${id}/approve`),
  rejectLecturer: (id: string) => api.patch(`/api/school/lecturers/${id}/reject`),
};