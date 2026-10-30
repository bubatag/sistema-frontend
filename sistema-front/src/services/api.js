
import axios from 'axios';

const API_RENDER = 'https://api-bubatag.onrender.com';
const API_LOCAL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_RENDER,
  timeout: 20000,
});

// Adiciona o token JWT em todas as requisições.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Se o Render estiver indisponível, tenta a API local.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    if (!config || config._tentouApiLocal) {
      return Promise.reject(error);
    }

    // Não troca de servidor por erros de autenticação,
    // validação ou rotas inexistentes.
    const renderIndisponivel =
      !error.response ||
      [502, 503, 504].includes(status);

    if (!renderIndisponivel) {
      return Promise.reject(error);
    }

    // Evita repetir a tentativa de fallback.
    config._tentouApiLocal = true;
    config.baseURL = API_LOCAL;

    console.warn(
      'API do Render indisponível. Tentando API local...'
    );

    try {
      return await api.request(config);
    } catch (erroLocal) {
      console.error('API local também está indisponível:', erroLocal);
      return Promise.reject(erroLocal);
    }
  }
);

// Sessão expirada: limpa os dados locais e volta para o login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const ehLogin = url.includes('/login');

    if (
      status === 401 &&
      !ehLogin &&
      localStorage.getItem('token')
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);
