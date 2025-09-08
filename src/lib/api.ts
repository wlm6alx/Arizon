"use client";

import axios from 'axios';
import Cookies from 'js-cookie';
import { decrypt } from './secure-cookie';

// Create the Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach interceptor to automatically include Bearer token if available
api.interceptors.request.use(
  (config) => {
    try {
      const cookie = Cookies.get('token');
      let token = null;
      
      if (cookie) {
        // Try to decrypt first (for encrypted cookies)
        const decrypted = decrypt(cookie);
        if (decrypted) {
          token = decrypted;
        } else {
          // Fallback: assume it's not encrypted (for backward compatibility)
          token = cookie;
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error processing auth token:', error);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear auth data
      Cookies.remove('token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
