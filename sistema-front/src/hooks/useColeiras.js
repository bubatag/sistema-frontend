import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { extrairLista, montarBubalino } from '@/lib/rebanho';
import { useUsuario } from './useUsuario';

const VAZIO = [];

// Uma única fonte de dados para todas as telas (cache compartilhado).
export function useColeiras({ atualizarAutomaticamente = false } = {}) {
  const { usuarioId } = useUsuario();

  const consulta = useQuery({
    queryKey: ['coleiras', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const resposta = await api.get(`/api/coleiras/usuario/${usuarioId}`);
      return extrairLista(resposta.data, 'coleiras');
    },
    refetchInterval: atualizarAutomaticamente ? 30000 : false,
  });

  const coleiras = consulta.data ?? VAZIO;

  const bubalinos = useMemo(
    () =>
      coleiras
        .filter((coleira) => coleira.ativo !== false)
        .map(montarBubalino)
        .filter((animal) => animal && animal.ativo),
    [coleiras]
  );

  return { ...consulta, usuarioId, coleiras, bubalinos };
}