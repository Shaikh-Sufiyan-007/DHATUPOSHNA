import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dhatu_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/signup')) {
        localStorage.removeItem('dhatu_auth_token');
        localStorage.removeItem('dhatu_auth_user');
      }
    }

    const errorData = error.response?.data;
    const validationDetails =
      errorData?.error?.details || errorData?.details || errorData?.errors || null;

    const customError = {
      message:
        errorData?.message ||
        error.message ||
        'An unexpected error occurred while communicating with the Ayurvedic Knowledge API.',
      status: error.response?.status,
      errors: validationDetails,
      details: validationDetails,
      isNetworkError: !error.response,
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
