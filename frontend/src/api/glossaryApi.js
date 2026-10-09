import apiClient from './client.js';

export const glossaryApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/glossary', { params });
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/glossary/${encodeURIComponent(idOrSlug)}`);
  },
};

export default glossaryApi;
