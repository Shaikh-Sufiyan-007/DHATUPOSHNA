import apiClient from './client.js';

export const authApi = {
  signup: async (userData) => {
    return apiClient.post('/auth/signup', userData);
  },

  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  getMe: async () => {
    return apiClient.get('/auth/me');
  },
};

export default authApi;
