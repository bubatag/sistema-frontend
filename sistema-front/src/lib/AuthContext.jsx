
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoadingAuth(false);
      return;
    }

    // O backend ainda não possui um endpoint /me.
    // O usuário será recuperado do armazenamento local após o login.
    try {
      const usuarioSalvo = localStorage.getItem('usuario');
      if (usuarioSalvo) {
        setUser(JSON.parse(usuarioSalvo));
      } else {
        localStorage.removeItem('token');
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      navigateToLogin: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
      },
      login: async (email, senha) => {
        const response = await api.post('/api/usuarios/login', {
          email,
          senha,
        });

        const { usuario, token } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuario));
        setUser(usuario);

        return usuario;
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
      },
    }),
    [user, isLoadingAuth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
