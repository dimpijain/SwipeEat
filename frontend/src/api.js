import axios from 'axios';

const api = axios.create({
  
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// We can also intercept requests to automatically add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;