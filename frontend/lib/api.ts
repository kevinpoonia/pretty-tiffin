import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Store Clerk's getToken function so the interceptor always fetches a fresh token.
// Clerk tokens expire every 60 seconds; storing the raw token causes 401s on any
// request made after the first minute.
let _getToken: (() => Promise<string | null>) | null = null;
export const setApiToken = (getter: (() => Promise<string | null>) | null) => {
  _getToken = getter;
};

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
