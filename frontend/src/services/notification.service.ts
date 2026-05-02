import api from '../lib/api';

export const notificationService = {
  getMyNotifications: (params?: any) => api.get('/api/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/api/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/api/notifications/${id}`),
};
