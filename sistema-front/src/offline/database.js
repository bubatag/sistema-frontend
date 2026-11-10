
import Dexie from "dexie";

export const db = new Dexie("BubatagOfflineDB");

// Versão 1: estrutura original do banco local.
db.version(1).stores({
  coleiras: `
    ++id,
    &clientId,
    serverId,
    usuarioId,
    statusSync,
    atualizadoEm
  `,

  bubalinos: `
    ++id,
    &clientId,
    serverId,
    usuarioId,
    coleiraClientId,
    coleira_id,
    statusSync,
    atualizadoEm
  `,

  operacoes: `
    ++id,
    &operationId,
    usuarioId,
    entidade,
    acao,
    clientId,
    status,
    criadaEm
  `
});

// Versão 2: adiciona o vínculo local da coleira
// às operações que aguardam sincronização.
db.version(2).stores({
  coleiras: `
    ++id,
    &clientId,
    serverId,
    usuarioId,
    statusSync,
    atualizadoEm
  `,

  bubalinos: `
    ++id,
    &clientId,
    serverId,
    usuarioId,
    coleiraClientId,
    coleira_id,
    statusSync,
    atualizadoEm
  `,

  operacoes: `
    ++id,
    &operationId,
    usuarioId,
    entidade,
    acao,
    clientId,
    coleiraClientId,
    status,
    criadaEm
  `
});
