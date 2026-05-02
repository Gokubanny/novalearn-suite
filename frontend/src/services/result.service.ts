import api from '../lib/api';

export const resultService = {
  uploadResults: (courseId: string, data: any) =>
    api.post(`/api/results/courses/${courseId}`, data),
  publishResults: (courseId: string, session?: string) =>
    api.patch(
      `/api/results/courses/${courseId}/publish`,
      {},
      { params: { session } }
    ),
  getCourseResults: (courseId: string, session?: string) =>
    api.get(`/api/results/courses/${courseId}`, { params: { session } }),
  getMyResults: (session?: string) =>
    api.get('/api/results/my-results', { params: { session } }),
  getTranscript: () => api.get('/api/results/my-transcript'),
};
