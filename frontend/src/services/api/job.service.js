import { http } from './apiClient';

export const jobService = {
  applyJob: async (applicationData) => {
    const response = await http.post('/jobs/apply', applicationData);
    return response?.data !== undefined ? response.data : response;
  },

  applyForJob: async (listingId, applicationData) => {
    return jobService.applyJob({ listingId, ...applicationData });
  },

  getMyApplications: async () => {
    const response = await http.get('/jobs/my-applications');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.applications || [];
  },

  getEmployerApplications: async () => {
    const response = await http.get('/jobs/employer-applications');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.applications || [];
  },

  updateApplicationStatus: async (applicationId, status, employerNotes) => {
    const response = await http.patch(`/jobs/applications/${applicationId}/status`, { status, employerNotes });
    return response?.data !== undefined ? response.data : response;
  }
};

export default jobService;

