import { listingsService } from './listings.service';
import { favoriteService } from './favorite.service';
import { chatService } from './chat.service';
import { notificationService } from './notification.service';
import { authService } from './auth.service';

export const dashboardService = {
  getOverviewStats: async () => {
    try {
      const [myListingsRes, favoritesRes, conversationsRes, notificationsRes] = await Promise.all([
        listingsService.getMyListings(),
        favoriteService.getFavorites(),
        chatService.getConversations(),
        notificationService.getNotifications()
      ]);

      const myListings = Array.isArray(myListingsRes) ? myListingsRes : (myListingsRes?.data || []);
      const favorites = Array.isArray(favoritesRes) ? favoritesRes : (favoritesRes?.data || []);
      const conversations = Array.isArray(conversationsRes) ? conversationsRes : (conversationsRes?.data || []);
      const notifications = Array.isArray(notificationsRes) ? notificationsRes : (notificationsRes?.data || []);

      const activeListings = myListings.filter(l => l && l.status === 'APPROVED');
      const totalViews = myListings.reduce((sum, l) => sum + (l?.views || 0), 0);

      return {
        activeListings: activeListings.length,
        totalViews,
        savedFavorites: favorites.length,
        unreadMessages: conversations.length,
        unreadNotifications: notifications.filter(n => n && !n.isRead).length,
        pendingOffers: 0
      };
    } catch (error) {
      console.error('getOverviewStats error:', error);
      return {
        activeListings: 0,
        totalViews: 0,
        savedFavorites: 0,
        unreadMessages: 0,
        unreadNotifications: 0,
        pendingOffers: 0
      };
    }
  },

  updateProfile: async (data) => {
    return authService.updateProfile(data);
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    return authService.changePassword({ currentPassword, newPassword });
  },

  getNotifications: async () => {
    return notificationService.getNotifications();
  },

  markNotificationRead: async (id) => {
    return notificationService.markAsRead(id);
  }
};

export default dashboardService;

