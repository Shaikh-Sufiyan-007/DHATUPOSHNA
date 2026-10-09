import apiClient from './client.js';

export const nyayaApi = {
  getAll: async () => {
    return apiClient.get('/nyayas');
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/nyayas/${encodeURIComponent(idOrSlug)}`);
  },
};

export default nyayaApi;
