import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur requêtes : ajouter le JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gc_pita_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur réponses : gérer l'expiration du JWT
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gc_pita_token');
      localStorage.removeItem('gc_pita_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
