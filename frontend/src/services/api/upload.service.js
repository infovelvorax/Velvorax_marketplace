import apiClient from './apiClient';

export const uploadService = {
  uploadFiles: async (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach(f => formData.append('files', f));
    } else {
      formData.append('files', files);
    }

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response?.urls || response?.data || (response?.url ? [response.url] : []);
  }
};
