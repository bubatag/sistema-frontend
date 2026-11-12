import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/services/api';
import { extrairLista, montarBubalino } from '@/lib/rebanho';
import { useUsuario } from './useUsuario';
import { db } from '@/offline/database';

const VAZIO = [];

/**
 * Identifica falhas que permitem utilizar o cache local.
 *
 * Falhas de conexão e erros 5xx indicam indisponibilidade.
 * Erros 4xx não devem ser tratados como falha de conexão.
 */
function permiteFallbackLocal(erro) {
  const status = erro?.response?.status;

  return !erro?.response || status >= 500;
}

/**
 * Gera um identificador local para registros vindos da API.
 */
function gerarClientId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Atualiza o cache com os registros recebidos da nuvem.
 *
 * Registros locais pendentes são preservados.
 * Registros sincronizados ausentes na API são removidos.
 */
async function atualizarCache(tabela, usuarioId, registros) {
  await db.transaction('rw', tabela, async () => {
    const registrosLocais = await tabela
      .where('usuarioId')
      .equals(String(usuarioId))
      .toArray();

    const idsRecebidos = new Set();

    for (const registro of registros) {
      const serverId = String(registro._id || registro.id || '');

      if (!serverId) continue;

      idsRecebidos.add(serverId);

      const existente = registrosLocais.find(
        (item) => String(item.serverId || '') === serverId
      );

      const dadosCache = {
        ...registro,
        clientId: existente?.clientId || gerarClientId(),
        serverId,
        usuarioId: String(usuarioId),
        statusSync: 'sincronizado',
        atualizadoEm: new Date().toISOString(),
      };

      if (existente) {
        await tabela.update(existente.id, dadosCache);
      } else {
        await tabela.add(dadosCache);
      }
    }

    // Preserva registros ainda não sincronizados.
    for (const registroLocal of registrosLocais) {
      const sincronizado =
        registroLocal.statusSync === 'sincronizado' ||
        Boolean(registroLocal.serverId);

      const serverId = String(registroLocal.serverId || '');

      if (
        sincronizado &&
        serverId &&
        !idsRecebidos.has(serverId)
      ) {
        await tabela.delete(registroLocal.id);
      }
    }
  });
}

/**
 * Busca primeiro na nuvem e utiliza o IndexedDB
 * somente quando a API estiver indisponível.
 */
async function buscarComFallback({
  tabela,
  usuarioId,
  requisicao,
  propriedade,
}) {
  try {
    const resposta = await requisicao();

    const registros = extrairLista(
      resposta.data,
      propriedade
    );

    await atualizarCache(tabela, usuarioId, registros);

    const registrosLocais = await tabela
      .where('usuarioId')
      .equals(String(usuarioId))
      .toArray();

    const pendentes = registrosLocais.filter(
      (item) => item.statusSync === 'pendente'
    );

    const serverIds = new Set(
      registros.map((registro) =>
        String(registro._id || registro.id || '')
      )
    );

    const pendentesSemDuplicidade = pendentes.filter(
      (local) =>
        !local.serverId ||
        !serverIds.has(String(local.serverId))
    );

    return [...registros, ...pendentesSemDuplicidade];
  } catch (erro) {
    if (!permiteFallbackLocal(erro)) {
      throw erro;
    }

    const registrosLocais = await tabela
      .where('usuarioId')
      .equals(String(usuarioId))
      .toArray();

    if (registrosLocais.length > 0) {
      return registrosLocais;
    }

    throw erro;
  }
}

export function useColeiras({
  atualizarAutomaticamente = false,
} = {}) {
  const { usuarioId } = useUsuario();

  // Consulta independente de coleiras.
  const consultaColeiras = useQuery({
    queryKey: ['coleiras', usuarioId],
    enabled: Boolean(usuarioId),

    queryFn: () =>
      buscarComFallback({
        tabela: db.coleiras,
        usuarioId,
        propriedade: 'coleiras',
        requisicao: () =>
          api.get(`/api/coleiras/usuario/${usuarioId}`),
      }),

    refetchInterval: atualizarAutomaticamente ? 30000 : false,
  });

  // Consulta independente de bubalinos.
  const consultaBubalinos = useQuery({
    queryKey: ['bubalinos', usuarioId],
    enabled: Boolean(usuarioId),

    queryFn: () =>
      buscarComFallback({
        tabela: db.bubalinos,
        usuarioId,
        propriedade: 'bubalinos',
        requisicao: () => api.get('/api/bubalinos'),
      }),

    refetchInterval: atualizarAutomaticamente ? 30000 : false,
  });

  const coleiras = consultaColeiras.data ?? VAZIO;
  const bubalinosCadastrados = consultaBubalinos.data ?? VAZIO;

  const bubalinos = useMemo(() => {
    return bubalinosCadastrados
      .filter((animal) => animal.excluido_em == null)
      .map((animal) => {
        const animalId = String(
          animal._id || animal.serverId || animal.id || ''
        );

        const coleira = coleiras.find((item) => {
          const referencia =
            item.bubalino_id?._id ||
            item.bubalino_id ||
            item.bubalino?._id ||
            item.bubalino?.id ||
            (typeof item.bubalino === 'string'
              ? item.bubalino
              : '');

          return String(referencia || '') === animalId;
        });

        return montarBubalino(animal, coleira || null);
      })
      .filter((animal) => animal && animal.ativo !== false);
  }, [bubalinosCadastrados, coleiras]);

  return {
    usuarioId,
    coleiras,
    bubalinos,

    isLoading:
      consultaColeiras.isLoading ||
      consultaBubalinos.isLoading,

    isFetching:
      consultaColeiras.isFetching ||
      consultaBubalinos.isFetching,

    isError:
      consultaColeiras.isError ||
      consultaBubalinos.isError,

    error:
      consultaBubalinos.error ||
      consultaColeiras.error,

    refetch: async () => {
      await Promise.all([
        consultaColeiras.refetch(),
        consultaBubalinos.refetch(),
      ]);
    },
  };
}
