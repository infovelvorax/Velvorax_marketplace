import { http } from './apiClient';

export const chatService = {
  getConversations: async () => {
    const response = await http.get('/conversations');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.conversations || [];
  },

  startConversation: async (sellerId, listingId) => {
    const response = await http.post('/conversations', { sellerId, listingId });
    return response?.data !== undefined ? response.data : response;
  },

  getMessages: async (conversationId) => {
    const response = await http.get(`/conversations/${conversationId}/messages`);
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.messages || [];
  },

  sendMessage: async (conversationId, messageData) => {
    const response = await http.post(`/conversations/${conversationId}/messages`, messageData);
    return response?.data !== undefined ? response.data : response;
  }
};

export default chatService;


