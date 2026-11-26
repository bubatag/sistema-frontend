import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';

// A fila local usa "criar"; a API aceita apenas "cadastrar".
const ACAO_API = {
  criar: 'cadastrar',
  cadastrar: 'cadastrar',
};

/**
 * Envia uma operação pendente para a API de sincronização.
 * Retorna o corpo da resposta ({ serverId, resultado, ... }).
 */
export async function enviarOperacao(operacao) {
  const acao = ACAO_API[operacao.acao];

  if (!acao) {
    throw new Error(
      `Ação offline ainda não suportada: ${operacao.acao}`
    );
  }

  const resposta = await api.post(ENDPOINTS.sincronizacao.enviar(), {
    operationId: operacao.operationId,
    entidade: operacao.entidade,
    acao,
    dados: operacao.dados,
  });

  return resposta.data;
}