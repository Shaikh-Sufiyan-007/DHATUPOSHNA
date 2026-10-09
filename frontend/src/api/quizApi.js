import apiClient from './client.js';

export const quizApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/quizzes', { params });
  },

  getByIdOrSlug: async (idOrSlug) => {
    return apiClient.get(`/quizzes/${encodeURIComponent(idOrSlug)}`);
  },
};

export default quizApi;
