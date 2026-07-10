import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to append authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle API error format
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract formatted message from centralized error handler
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    const status = error.response?.status || 500;
    
    const formattedError = new Error(message);
    formattedError.status = status;
    formattedError.response = error.response;
    
    return Promise.reject(formattedError);
  }
);

export default api;
