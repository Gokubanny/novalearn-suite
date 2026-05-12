import api from '../lib/api';

export const materialService = {
  list: (courseId: string) => api.get(`/api/materials/courses/${courseId}`),
  upload: (courseId: string, file: File, title: string, description?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    if (description) fd.append('description', description);
    return api.post(`/api/materials/courses/${courseId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  remove: (id: string) => api.delete(`/api/materials/${id}`),
};
