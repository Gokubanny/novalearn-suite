import api from '../lib/api';

export const schoolService = {
  getStats: () => api.get('/api/school/stats'),
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
  getPendingStudents: () => api.get('/api/school/students/pending'),
  getAllStudents: (params?: any) => api.get('/api/school/students', { params }),
  approveStudent: (id: string) => api.patch(`/api/school/students/${id}/approve`),
  rejectStudent: (id: string, reason: string) =>
    api.patch(`/api/school/students/${id}/reject`, { reason }),
  suspendStudent: (id: string) => api.patch(`/api/school/students/${id}/suspend`),
  getPendingLecturers: () => api.get('/api/school/lecturers/pending'),
  getAllLecturers: () => api.get('/api/school/lecturers'),
  approveLecturer: (id: string) => api.patch(`/api/school/lecturers/${id}/approve`),
  rejectLecturer: (id: string) => api.patch(`/api/school/lecturers/${id}/reject`),
  getStudentProfile: (studentId: string) =>
    api.get(`/api/school/students/${studentId}/profile`),
  
  getLecturerProfile: (lecturerId: string) =>
    api.get(`/api/school/lecturers/${lecturerId}/profile`),
};

