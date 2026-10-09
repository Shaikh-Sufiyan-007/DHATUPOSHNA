import apiClient from './client.js';

export const dhatuposhanaApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/dhatuposhana', { params });
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/dhatuposhana/${encodeURIComponent(idOrSlug)}`);
  },

  getByDhatuId: async (dhatuId) => {
    return apiClient.get('/dhatuposhana', { params: { dhatuId } });
  },
};

export default dhatuposhanaApi;
