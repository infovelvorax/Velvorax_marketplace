import { http } from './apiClient';

export const notificationService = {
  getNotifications: async () => {
    const response = await http.get('/notifications');
    return response;
  },

  getUnreadCount: async () => {
    const response = await http.get('/notifications');
    if (typeof response?.unreadCount === 'number') return response.unreadCount;
    if (typeof response?.data?.unreadCount === 'number') return response.data.unreadCount;
    const list = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
    return list.filter(n => !n.isRead).length;
  },

  markAsRead: async (id) => {
    const response = await http.patch(`/notifications/${id}/read`);
    return response?.data !== undefined ? response.data : response;
  },

  markAllAsRead: async () => {
    const response = await http.patch('/notifications/mark-all-read');
    return response?.data !== undefined ? response.data : response;
  },

  deleteNotification: async (id) => {
    const response = await http.delete(`/notifications/${id}`);
    return response?.data !== undefined ? response.data : response;
  }
};

export default notificationService;
