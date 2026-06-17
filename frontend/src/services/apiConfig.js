import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // aqui va la url real
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor  mete automáticamente el token de seguridad si el usuario inició sesión
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
