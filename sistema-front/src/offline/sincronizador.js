
import { db } from "./database";
import {
  listarOperacoesPendentes,
  atualizarStatusOperacao
} from "./operacoes";

/**
 * Organiza e sincroniza as operações pendentes.
 * Coleiras precisam ser sincronizadas antes dos bubalinos.
 */
export async function sincronizarDados(usuarioId, enviarOperacao) {
  if (!navigator.onLine) {
    return {
      sucesso: false,
      mensagem: "Sem conexão com a internet.",
      sincronizadas: 0,
      comErro: 0,
      aguardandoDependencia: 0,
      erros: []
    };
  }

  const operacoes = await listarOperacoesPendentes(usuarioId);

  if (operacoes.length === 0) {
    return {
      sucesso: true,
      mensagem: "Não há operações pendentes.",
      sincronizadas: 0,
      comErro: 0,
      aguardandoDependencia: 0,
      erros: []
    };
  }

  const ordem = {
    coleira: 1,
    bubalino: 2
  };

  operacoes.sort((a, b) => {
    const diferenca =
      (ordem[a.entidade] ?? 99) -
      (ordem[b.entidade] ?? 99);

    return diferenca || new Date(a.criadaEm) - new Date(b.criadaEm);
  });

  const resultados = {
    sincronizadas: 0,
    comErro: 0,
    aguardandoDependencia: 0,
    erros: []
  };

  // Guarda as coleiras que falharam nesta tentativa.
  const coleirasComErro = new Set();

  for (const operacao of operacoes) {
    try {
      // Não envia o bubalino se sua coleira falhou.
      if (
        operacao.entidade === "bubalino" &&
        operacao.coleiraClientId &&
        coleirasComErro.has(operacao.coleiraClientId)
      ) {
        await atualizarStatusOperacao(
          operacao.operationId,
          "pendente"
        );

        resultados.aguardandoDependencia++;
        continue;
      }

      let operacaoParaEnviar = { ...operacao };

      // Resolve o ID definitivo da coleira.
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
          await atualizarStatusOperacao(
            operacao.operationId,
            "pendente"
          );

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

      // Confirmação local e remoção da fila na mesma transação.
      await db.transaction(
        "rw",
        tabela,
        db.operacoes,
        async () => {
          const registro = await tabela
            .where("clientId")
            .equals(operacao.clientId)
            .first();

          if (!registro) {
            throw new Error(
              "O registro local não foi encontrado. A operação foi mantida na fila."
            );
          }

          await tabela.update(registro.id, {
            serverId: resposta.serverId,
            statusSync: "sincronizado",
            atualizadoEm: new Date().toISOString()
          });

          await db.operacoes
            .where("operationId")
            .equals(operacao.operationId)
            .delete();
        }
      );

      resultados.sincronizadas++;

    } catch (erro) {
      if (operacao.entidade === "coleira") {
        coleirasComErro.add(operacao.clientId);
      }

      const mensagem =
        erro?.message || "Erro desconhecido ao sincronizar.";

      try {
        await atualizarStatusOperacao(
          operacao.operationId,
          "pendente",
          mensagem
        );
      } catch (erroStatus) {
        console.error(
          "[SYNC] Não foi possível atualizar o status da operação:",
          erroStatus
        );
      }

      resultados.comErro++;

      resultados.erros.push({
        operationId: operacao.operationId,
        entidade: operacao.entidade,
        rotulo:
          operacao.dados?.n_coleira ||
          operacao.dados?.n_etiqueta ||
          operacao.clientId,
        mensagem
      });

      console.error(
        `[SYNC] Erro ao sincronizar ${operacao.entidade}:`,
        erro
      );
    }
  }

  return {
    sucesso:
      resultados.comErro === 0 &&
      resultados.aguardandoDependencia === 0,
    ...resultados
  };
}
