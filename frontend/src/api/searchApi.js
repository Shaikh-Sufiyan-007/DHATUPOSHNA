import apiClient from './client.js';

export const searchApi = {
  search: async (query, params = {}) => {
    return apiClient.get('/search', {
      params: {
        q: query,
        ...params,
      },
    });
  },
};

export default searchApi;
