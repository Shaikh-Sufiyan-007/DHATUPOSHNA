import apiClient from './client.js';

export const dhatvagniApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/dhatvagni', { params });
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/dhatvagni/${encodeURIComponent(idOrSlug)}`);
  },

  getByDhatuId: async (dhatuId) => {
    return apiClient.get('/dhatvagni', { params: { dhatuId } });
  },
};

export default dhatvagniApi;
