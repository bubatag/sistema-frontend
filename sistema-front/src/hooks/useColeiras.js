
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { extrairLista, montarBubalino } from '@/lib/rebanho';
import { useUsuario } from './useUsuario';

const VAZIO = [];

export function useColeiras({ atualizarAutomaticamente = false } = {}) {
  const { usuarioId } = useUsuario();

  // Busca as coleiras independentemente dos bubalinos.
  const consultaColeiras = useQuery({
    queryKey: ['coleiras', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const resposta = await api.get(
        `/api/coleiras/usuario/${usuarioId}`
      );

      return extrairLista(resposta.data, 'coleiras');
    },
    refetchInterval: atualizarAutomaticamente ? 30000 : false,
  });

  // Busca os bubalinos diretamente pela rota própria.
  const consultaBubalinos = useQuery({
    queryKey: ['bubalinos', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const resposta = await api.get('/api/bubalinos');

      return extrairLista(resposta.data, 'bubalinos');
    },
    refetchInterval: atualizarAutomaticamente ? 30000 : false,
  });

  const coleiras = consultaColeiras.data ?? VAZIO;
  const bubalinosCadastrados = consultaBubalinos.data ?? VAZIO;

  // Monta cada bubalino a partir do próprio cadastro.
  // A coleira é apenas uma informação complementar.
  const bubalinos = useMemo(() => {
    return bubalinosCadastrados
      .filter((animal) => animal.excluido_em == null)
      .map((animal) => {
        const animalId = String(animal._id || animal.id || '');

        const coleira = coleiras.find((item) => {
          const referencia =
            item.bubalino_id?._id ||
            item.bubalino_id ||
            item.bubalino?._id ||
            item.bubalino?.id ||
            (typeof item.bubalino === 'string' ? item.bubalino : '');

          return String(referencia || '') === animalId;
        });

        return montarBubalino(animal, coleira || null);
      })
      // Mantém na lista apenas bubalinos ativos.
      .filter((animal) => animal && animal.ativo !== false);
  }, [bubalinosCadastrados, coleiras]);

  return {
    usuarioId,
    coleiras,
    bubalinos,

    isLoading:
      consultaColeiras.isLoading || consultaBubalinos.isLoading,

    isFetching:
      consultaColeiras.isFetching || consultaBubalinos.isFetching,

    isError:
      consultaColeiras.isError || consultaBubalinos.isError,

    error:
      consultaBubalinos.error || consultaColeiras.error,

    refetch: async () => {
      await Promise.all([
        consultaColeiras.refetch(),
        consultaBubalinos.refetch(),
      ]);
    },
  };
}
