import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for large multimodal vision payloads
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('visioninsight_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If 401 and token exists, it may be expired
      const token = localStorage.getItem('visioninsight_token');
      if (token) {
        localStorage.removeItem('visioninsight_token');
        localStorage.removeItem('visioninsight_user');
        // Dispatch an event so AuthContext can clean up state
        window.dispatchEvent(new Event('auth:expired'));
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const scanAPI = {
  analyze: (data) => api.post('/scans/analyze', data),
  getScans: (params) => api.get('/scans', { params }),
  getScanById: (id) => api.get(`/scans/${id}`),
  deleteScan: (id) => api.delete(`/scans/${id}`),
};

export const dashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

export default api;

