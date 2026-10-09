import apiClient from './client.js';

export const referenceApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/references', { params });
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/references/${encodeURIComponent(idOrSlug)}`);
  },
};

export default referenceApi;
