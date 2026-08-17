import api from '../lib/api';

export const lecturerService = {
  getStudentPerformance: () => api.get('/api/lecturer/student-performance'),
};