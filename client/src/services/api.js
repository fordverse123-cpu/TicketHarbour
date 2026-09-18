import axios from 'axios';

const API = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle 401 & automatic token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent endless refresh loops
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        await API.post('/auth/refresh');
        return API(originalRequest);
      } catch (refreshError) {
        // Refresh failed -> redirect to login or clear auth state
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;
