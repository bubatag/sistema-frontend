
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Radio, Search, RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';

import { api } from '@/services/api';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Coleiras() {
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  const usuario = useMemo(() => {
    try {
      return user || JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  }, [user]);

  const usuarioId = usuario?._id || usuario?.id;

  const {
    data: coleiras = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['coleiras', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const response = await api.get(
        `/api/coleiras/usuario/${usuarioId}`
      );

      const dados = response.data;
      const lista = Array.isArray(dados)
        ? dados
        : dados.coleiras || dados.data || [];

      return lista;
    },
  });

  const filtered = coleiras.filter((c) => {
    const termo = search.toLowerCase();

    return (
      !termo ||
      String(c.n_coleira || '').toLowerCase().includes(termo) ||
      String(c.IP || '').toLowerCase().includes(termo) ||
      String(c.coleira_localizacao || '').toLowerCase().includes(termo) ||
      String(c.bubalino?.n_etiqueta || '').toLowerCase().includes(termo) ||
      String(c.bubalino?.raca || '').toLowerCase().includes(termo)
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Coleiras
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie as coleiras IoT do rebanho
          </p>
        </div>

        <Button
          disabled
          title="O cadastro precisa ser implementado na API"
          className="bg-primary"
        >
          <Plus className="mr-2 h-4 w-4" />
          Cadastrar Coleira
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por coleira, IP ou bubalino..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-border bg-card pl-9"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          Atualizar dados
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg bg-card" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-card p-6">
          <p className="font-medium text-destructive">
            Não foi possível carregar as coleiras.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.response?.data?.mensagem ||
              error?.message ||
              'Verifique a API e sua autenticação.'}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : !usuarioId ? (
        <div className="rounded-xl border border-border bg-card p-6">
          Não foi possível identificar o usuário. Entre novamente no sistema.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <Radio className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">Nenhuma coleira encontrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {coleiras.length === 0
              ? 'A API não retornou coleiras para este usuário.'
              : 'Tente alterar o termo da busca.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Tag', 'Localização', 'IP', 'Bubalino', 'Status'].map(
                    (titulo) => (
                      <th
                        key={titulo}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {titulo}
                      </th>
                    )
                  )}
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c, index) => (
                  <tr
                    key={c._id || c.n_coleira || index}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-mono text-sm font-medium">
                      {c.n_coleira || '—'}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {c.coleira_localizacao || '—'}
                    </td>

                    <td className="px-4 py-3 font-mono text-sm text-muted-foreground">
                      {c.IP || '—'}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <div>{c.bubalino?.n_etiqueta || '—'}</div>
                      {c.bubalino?.raca && (
                        <div className="text-xs text-muted-foreground">
                          {c.bubalino.raca}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={c.ativo === true ? 'ativa' : 'inativa'}
                      />
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          disabled
                          title="Edição ainda não disponível na API"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          disabled
                          title="Exclusão ainda não disponível na API"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs text-muted-foreground">
            Exibindo {filtered.length} de {coleiras.length} coleira(s).
          </div>
        </div>
      )}
    </div>
  );
}
