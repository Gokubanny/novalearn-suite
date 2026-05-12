import api from '../lib/api';

export const discussionService = {
  list: (courseId: string) => api.get(`/api/discussions/courses/${courseId}`),
  create: (courseId: string, data: { title: string; body: string }) =>
    api.post(`/api/discussions/courses/${courseId}`, data),
  reply: (id: string, body: string) =>
    api.post(`/api/discussions/${id}/replies`, { body }),
  togglePin: (id: string) => api.patch(`/api/discussions/${id}/pin`),
  remove: (id: string) => api.delete(`/api/discussions/${id}`),
};
