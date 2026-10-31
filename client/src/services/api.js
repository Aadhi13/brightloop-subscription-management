import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = error.response?.data?.error || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error communicating with Brightloop server',
      details: [],
    };
    return Promise.reject(errorPayload);
  }
);

export const checkHealth = async () => {
  return apiClient.get('/health');
};

export default apiClient;
