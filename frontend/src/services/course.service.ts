import api from '../lib/api';

export const courseService = {
  createCourse: (data: any) => api.post('/api/courses', data),
  getLecturerCourses: () => api.get('/api/courses/my-courses'),
  getStudentCourses: () => api.get('/api/courses/enrolled'),
  getAllCourses: (params?: any) => api.get('/api/courses/all', { params }),
  getCourseStudents: (courseId: string) =>
    api.get(`/api/courses/${courseId}/students`),
  enrolInCourse: (courseId: string) => api.post(`/api/courses/${courseId}/enrol`),
  dropCourse: (courseId: string) => api.delete(`/api/courses/${courseId}/drop`),
  updateCourse: (id: string, data: any) => api.patch(`/api/courses/${id}`, data),
  deleteCourse: (id: string) => api.delete(`/api/courses/${id}`),
};
