import axios, { AxiosError } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.royalgccforex.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized error - maybe redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        if (!window.location.pathname.startsWith('/login')) window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/** The API's own error message (response.data.message) when there is one, otherwise the fallback. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  const err = error as AxiosError<{ message?: string; error?: string }> | undefined;
  return err?.response?.data?.message || err?.response?.data?.error || fallback;
}

export default api;

