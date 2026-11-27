
import { db } from "./database";

function gerarId() {
  return crypto.randomUUID();
}

/**
 * Registra uma operação pendente de sincronização.
 *
 * entidade: "coleira" ou "bubalino"
 * acao: "criar", "atualizar" ou "excluir"
 *
 * coleiraClientId:
 * Identificador local da coleira associada ao bubalino.
 */
export async function registrarOperacao({
  usuarioId,
  entidade,
  acao,
  clientId,
  coleiraClientId = null,
  dados
}) {
  if (!usuarioId || !entidade || !acao || !clientId || !dados) {
    throw new Error("Dados insuficientes para registrar a operação.");
  }

  if (!["coleira", "bubalino"].includes(entidade)) {
    throw new Error("Entidade inválida.");
  }

  const operacao = {
    operationId: gerarId(),
    usuarioId: String(usuarioId),
    entidade,
    acao,
    clientId,
    coleiraClientId,
    dados,
    status: "pendente",
    criadaEm: new Date().toISOString(),
    tentativas: 0,
    erro: null
  };

  await db.operacoes.add(operacao);

  return operacao;
}

/**
 * Lista as operações pendentes ou interrompidas de um usuário.
 * Operações que ficaram em "sincronizando" podem ser retomadas
 * após o fechamento inesperado do aplicativo.
 */
export async function listarOperacoesPendentes(usuarioId) {
  const operacoes = await db.operacoes
    .where("usuarioId")
    .equals(String(usuarioId))
    .toArray();

  return operacoes
    .filter((operacao) =>
      ["pendente", "sincronizando"].includes(operacao.status)
    )
    .sort((a, b) => {
      return new Date(a.criadaEm) - new Date(b.criadaEm);
    });
}

/**
 * Atualiza o estado de uma operação.
 * Incrementa tentativas somente quando ocorre uma falha.
 */
export async function atualizarStatusOperacao(
  operationId,
  status,
  erro = null
) {
  const operacao = await db.operacoes
    .where("operationId")
    .equals(operationId)
    .first();

  if (!operacao) {
    throw new Error("Operação não encontrada.");
  }

  const houveFalha = status === "pendente" && erro !== null;

  await db.operacoes.update(operacao.id, {
    status,
    erro,
    tentativas:
      (operacao.tentativas || 0) + (houveFalha ? 1 : 0)
  });
}

/**
 * Remove uma operação após a confirmação da API
 * e a atualização do registro local.
 */
export async function removerOperacao(operationId) {
  await db.operacoes
    .where("operationId")
    .equals(operationId)
    .delete();
}
