import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useUsuario } from '@/hooks/useUsuario';
import { sincronizarDados } from '@/offline/sincronizador';
import { enviarOperacao } from '@/offline/enviarOperacao';

const INTERVALO_MS = 30000;

export function useSincronizacaoAutomatica() {
  const { usuarioId } = useUsuario();
  const queryClient = useQueryClient();
  const emAndamento = useRef(false);

  const sincronizar = useCallback(async () => {
    // Evita duas sincronizações ao mesmo tempo.
    if (!usuarioId || emAndamento.current) return null;

    emAndamento.current = true;

    try {
      const resultado = await sincronizarDados(
        usuarioId,
        enviarOperacao
      );

      const houveErroDefinitivo = resultado?.erros?.length > 0;

      // Atualiza as listas quando algo mudou (sincronizou ou falhou de vez).
      if (resultado?.sincronizadas > 0 || houveErroDefinitivo) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['coleiras', usuarioId],
          }),
          queryClient.invalidateQueries({
            queryKey: ['bubalinos', usuarioId],
          }),
        ]);
      }

      if (resultado?.sincronizadas > 0) {
        toast.success(
          `${resultado.sincronizadas} registro(s) sincronizado(s) com a nuvem.`
        );
      }

      // Falhas definitivas: o usuário precisa saber o motivo.
      if (houveErroDefinitivo) {
        resultado.erros.forEach((erro) => {
          toast.error(
            `Não foi possível sincronizar ${erro.rotulo}: ${erro.mensagem}`,
            { duration: 10000 }
          );
        });
      }

      return resultado;
    } catch (erro) {
      console.error('[SYNC] Falha inesperada:', erro);
      return null;
    } finally {
      emAndamento.current = false;
    }
  }, [usuarioId, queryClient]);

  useEffect(() => {
    if (!usuarioId) return undefined;

    sincronizar();

    const aoVoltarOnline = () => sincronizar();
    window.addEventListener('online', aoVoltarOnline);

    // navigator.onLine não garante que a API responde,
    // então também tenta periodicamente.
    const timer = setInterval(sincronizar, INTERVALO_MS);

    return () => {
      window.removeEventListener('online', aoVoltarOnline);
      clearInterval(timer);
    };
  }, [usuarioId, sincronizar]);

  return { sincronizar };
}