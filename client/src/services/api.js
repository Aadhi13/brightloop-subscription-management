import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

// System Health
export const checkHealth = async () => {
  return apiClient.get('/health');
};

// Authentication Services
export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const register = (customerData) => {
  return apiClient.post('/auth/register', customerData);
};

export const logout = () => {
  return apiClient.post('/auth/logout');
};

export const getMe = () => {
  return apiClient.get('/auth/me');
};

export const forgotPassword = (email) => {
  return apiClient.post('/auth/forgot-password', { email });
};

export const resetPassword = (data) => {
  return apiClient.post('/auth/reset-password', data);
};

// User & Staff Management (Admin only)
export const getUsers = (params) => {
  return apiClient.get('/users', { params });
};

export const createStaff = (staffData) => {
  return apiClient.post('/users/staff', staffData);
};

export const updateUserStatus = (id, isActive) => {
  return apiClient.patch(`/users/${id}/status`, { isActive });
};

// Customer Services
export const getCustomer = (id) => {
  return apiClient.get(`/customers/${id}`);
};

export const updateCustomer = (id, data) => {
  return apiClient.patch(`/customers/${id}`, data);
};

export const getCustomers = (params) => {
  return apiClient.get('/customers', { params });
};

export default apiClient;
