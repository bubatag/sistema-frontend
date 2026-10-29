
import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://api-bubatag.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Sessão expirada: limpa os dados locais e volta para o login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const ehLogin = url.includes('/login');

    if (status === 401 && !ehLogin && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);
