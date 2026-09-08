import { http } from './apiClient';

export const reportService = {
  createReport: async (reportData) => {
    const response = await http.post('/reports', reportData);
    return response?.data !== undefined ? response.data : response;
  },

  getReports: async () => {
    const response = await http.get('/reports');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.reports)) return response.reports;
    if (Array.isArray(response)) return response;
    return response?.data?.reports || [];
  },

  updateReportStatus: async (reportId, payload) => {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    const response = await http.patch(`/reports/${reportId}`, body);
    return response?.data !== undefined ? response.data : response;
  },

  resolveReport: async (reportId, payload) => {
    const body = typeof payload === 'string' ? { action: payload, status: payload } : payload;
    const response = await http.patch(`/reports/${reportId}/resolve`, body);
    return response?.data !== undefined ? response.data : response;
  }
};

export default reportService;

