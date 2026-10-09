import apiClient from './client.js';

export const dhatuApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/dhatus', { params });
  },

  getBySlugOrId: async (idOrSlug) => {
    return apiClient.get(`/dhatus/${encodeURIComponent(idOrSlug)}`);
  },
};

export default dhatuApi;
