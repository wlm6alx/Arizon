"use client";

import axios from 'axios';
import Cookies from 'js-cookie';
import { decrypt } from './secure-cookie';

// Create the Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach interceptor to automatically include Bearer token if available
api.interceptors.request.use(
  (config) => {
    const cookie = Cookies.get('token');
    const token = cookie ? decrypt(cookie) : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
