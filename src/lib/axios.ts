import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock interceptor for demonstration
api.interceptors.request.use((config) => {
  console.log(`Starting Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

export default api;
