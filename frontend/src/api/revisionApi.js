import apiClient from './client.js';

export const revisionApi = {
  getDhatuComparison: async () => {
    return apiClient.get('/revision/dhatu-comparison');
  },

  getNyayaComparison: async () => {
    return apiClient.get('/revision/nyaya-comparison');
  },

  getQuickNotes: async () => {
    return apiClient.get('/revision/quick-notes');
  },
};

export default revisionApi;
