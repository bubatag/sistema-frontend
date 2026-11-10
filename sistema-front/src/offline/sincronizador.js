
import { db } from "./database";
import {
  listarOperacoesPendentes,
  atualizarStatusOperacao,
  removerOperacao
} from "./operacoes";

/**
 * Organiza as operações pendentes.
 * Coleiras precisam ser sincronizadas antes dos bubalinos.
 */
export async function sincronizarDados(usuarioId, enviarOperacao) {
  if (!navigator.onLine) {
    return {
      sucesso: false,
      mensagem: "Sem conexão com a internet."
    };
  }

  const operacoes = await listarOperacoesPendentes(usuarioId);

  if (operacoes.length === 0) {
    return {
      sucesso: true,
      mensagem: "Não há operações pendentes."
    };
  }

  const ordem = {
    coleira: 1,
    bubalino: 2
  };

  operacoes.sort((a, b) => {
    return (
      (ordem[a.entidade] ?? 99) -
      (ordem[b.entidade] ?? 99)
    );
  });

  const resultados = {
    sincronizadas: 0,
    comErro: 0,
    aguardandoDependencia: 0
  };

  // Guarda as coleiras que falharam nesta tentativa de sincronização.
  const coleirasComErro = new Set();

  for (const operacao of operacoes) {
    try {
      // Impede o envio do bubalino se sua coleira falhou.
      if (
        operacao.entidade === "bubalino" &&
        operacao.coleiraClientId &&
        coleirasComErro.has(operacao.coleiraClientId)
      ) {
        resultados.aguardandoDependencia++;
        continue;
      }

      let operacaoParaEnviar = { ...operacao };

      // Resolve o ID definitivo da coleira antes de enviar o bubalino.
      if (operacao.entidade === "bubalino") {
        if (!operacao.coleiraClientId) {
          throw new Error(
            "O bubalino não possui o identificador local da coleira."
          );
        }

        const coleiraLocal = await db.coleiras
          .where("clientId")
          .equals(operacao.coleiraClientId)
          .first();

        if (!coleiraLocal?.serverId) {
          resultados.aguardandoDependencia++;
          continue;
        }

        operacaoParaEnviar = {
          ...operacao,
          dados: {
            ...operacao.dados,
            coleira_id: coleiraLocal.serverId
          }
        };
      }

      await atualizarStatusOperacao(
        operacao.operationId,
        "sincronizando"
      );

      const resposta = await enviarOperacao(operacaoParaEnviar);

      if (!resposta?.serverId) {
        throw new Error(
          "A API não retornou o identificador do registro sincronizado."
        );
      }

      const tabela =
        operacao.entidade === "coleira"
          ? db.coleiras
          : db.bubalinos;

      const registro = await tabela
        .where("clientId")
        .equals(operacao.clientId)
        .first();

      if (registro) {
        await tabela.update(registro.id, {
          serverId: resposta.serverId,
          statusSync: "sincronizado",
          atualizadoEm: new Date().toISOString()
        });
      }

      await removerOperacao(operacao.operationId);

      resultados.sincronizadas++;
    } catch (erro) {
      if (operacao.entidade === "coleira") {
        coleirasComErro.add(operacao.clientId);
      }

      await atualizarStatusOperacao(
        operacao.operationId,
        "pendente",
        erro?.message || "Erro ao sincronizar."
      );

      resultados.comErro++;
    }
  }

  return {
    sucesso:
      resultados.comErro === 0 &&
      resultados.aguardandoDependencia === 0,
    ...resultados
  };
}
