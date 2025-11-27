import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log('[API] Request:', config.method?.toUpperCase(), config.url, { hasToken: !!token });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      console.log('[API] 401 Unauthorized - clearing auth and redirecting');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; full_name?: string; role?: string }) =>
    apiClient.post('/auth/register', { ...data, role: data.role || 'student' }),
  
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  
  logout: () => apiClient.post('/auth/logout'),
  
  me: () => apiClient.get('/auth/me'),
};

// Documents API
export const documentsAPI = {
  getAll: (params?: any) => apiClient.get('/documents', { params }),
  
  getById: (id: string) => apiClient.get(`/documents/${id}`),
  
  create: (data: any) => apiClient.post('/documents', data),
  
  update: (id: string, data: any) => apiClient.put(`/documents/${id}`, data),
  
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
  
  download: (id: string) => apiClient.post(`/documents/${id}/download`),
  
  getTeacherStats: () => apiClient.get('/documents/teacher/stats'),
};

export default apiClient;
