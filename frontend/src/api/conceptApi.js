import apiClient from './client.js';

export const conceptApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/concepts', { params });
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/concepts/${encodeURIComponent(idOrSlug)}`);
  },
};

export default conceptApi;
