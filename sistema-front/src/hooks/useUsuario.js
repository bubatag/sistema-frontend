import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';

export function useUsuario() {
  const { user } = useAuth();

  return useMemo(() => {
    let usuario = user;

    if (!usuario) {
      try {
        usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
      } catch {
        usuario = null;
      }
    }

    return { usuario, usuarioId: usuario?._id || usuario?.id || null };
  }, [user]);
}