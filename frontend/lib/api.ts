import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Clerk stores its session token in a cookie that clerk-js manages.
// We expose a setter so AuthContext can push the latest token in.
let _clerkToken: string | null = null;
export const setApiToken = (token: string | null) => { _clerkToken = token; };

api.interceptors.request.use((config) => {
  if (_clerkToken) {
    config.headers['Authorization'] = `Bearer ${_clerkToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
