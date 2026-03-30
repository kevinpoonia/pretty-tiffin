import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Needs to send cookies if using HttpOnly, but we are using Authorization headers.
});

// Intercept requests to attach JWT Token
api.interceptors.request.use(
  (config) => {
    // In NextJS (client-side), we can get the token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global error handling (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optional: redirect to login if auth is completely rejected
        // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
