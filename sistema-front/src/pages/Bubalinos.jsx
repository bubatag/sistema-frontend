
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Bug,
  Thermometer,
  HeartPulse,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return '—';

  const nascimento = new Date(dataNascimento);

  if (Number.isNaN(nascimento.getTime())) return '—';

  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() &&
      hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) idade--;

  return `${Math.max(0, idade)} ${idade === 1 ? 'ano' : 'anos'}`;
}

function normalizarStatus(estado) {
  const valor = String(estado || '').toLowerCase();

  if (valor === 'normal') return 'saudavel';

  if (valor.includes('estress')) return 'estressado';

  if (valor === 'alerta') return 'estressado';

  if (valor === 'ocioso') return 'saudavel';

  return 'sem_conexao';
}

function obterDadosAtuais(bubalino) {
  const dados = (bubalino.dados || []).filter(
    (item) => item.ativo !== false
  );

  return dados.length ? dados[dados.length - 1] : null;
}

function obterEstadoEstresse(bubalino) {
  const historico = (bubalino.historico_estresse || []).filter(
    (item) => item.ativo !== false
  );

  return historico.length
    ? historico[historico.length - 1].estado_estresse
    : 'Sem leitura';
}

function formatarSexo(sexo) {
  if (sexo === 'Masculino') return 'Macho';
  if (sexo === 'Feminino') return 'Fêmea';
  return sexo || '—';
}

export default function Bubalinos() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const usuarioSalvo = localStorage.getItem('usuario');
  let usuarioId = null;

  try {
    usuarioId = usuarioSalvo ? JSON.parse(usuarioSalvo)?.id : null;
  } catch {
    usuarioId = null;
  }

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

      // A API pode devolver a lista diretamente ou dentro de "value".
      const resultado = response.data;
      if (Array.isArray(resultado)) return resultado;
      if (Array.isArray(resultado?.value)) return resultado.value;
      if (Array.isArray(resultado?.coleiras)) return resultado.coleiras;

      return [];
    },
  });

  const bubalinos = useMemo(() => {
    return coleiras
      .filter((coleira) => coleira.ativo !== false)
      .filter((coleira) => coleira.bubalino)
      .map((coleira) => {
        const animal = coleira.bubalino;
        const dadoAtual = obterDadosAtuais(animal);
        const estadoEstresse = obterEstadoEstresse(animal);

        return {
          id: animal._id,
          nome: animal.nome || animal.n_etiqueta || 'Bubalino sem nome',
          raca: animal.raca,
          numero_etiqueta: animal.n_etiqueta,
          dt_nasc: animal.dt_nasc,
          idade: calcularIdade(animal.dt_nasc),
          sexo: animal.sexo,
          coleira_id: coleira._id,
          coleira_nome: coleira.n_coleira,
          coleira_localizacao: coleira.coleira_localizacao,
          status: normalizarStatus(estadoEstresse),
          estado_estresse: estadoEstresse,
          temperatura: dadoAtual?.temperatura ?? null,
          batimentos: dadoAtual?.batimento_cardiaco ?? null,
          data_leitura: dadoAtual?.data ?? null,
          ativo: animal.ativo !== false,
        };
      })
      .filter((animal) => animal.ativo);
  }, [coleiras]);

  const filtered = bubalinos.filter((animal) => {
    const termo = search.trim().toLowerCase();

    const matchSearch =
      !termo ||
      animal.nome.toLowerCase().includes(termo) ||
      String(animal.numero_etiqueta || '').toLowerCase().includes(termo) ||
      String(animal.raca || '').toLowerCase().includes(termo) ||
      String(animal.coleira_nome || '').toLowerCase().includes(termo);

    const matchStatus =
      statusFilter === 'all' || animal.status === statusFilter;

    return matchSearch && matchStatus;
  });

  if (!usuarioId) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold">Bubalinos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Não foi possível identificar o usuário autenticado. Saia da conta
          e entre novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Bubalinos
          </h1>
          <p className="mt-1 text-muted-foreground">
            Animais cadastrados e monitorados pela API Bubatag
          </p>
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por etiqueta, raça ou coleira..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="border-border bg-card pl-9"
          />
        </div>

        <select
          aria-label="Filtrar bubalinos por status"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm sm:w-48"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="saudavel">Saudável</option>
          <option value="estressado">Estressado / alerta</option>
          <option value="sem_conexao">Sem leitura de estresse</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              className="h-16 rounded-lg bg-card"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/30 bg-card p-6">
          <h2 className="font-semibold">Não foi possível carregar os bubalinos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.response?.data?.mensagem ||
              error?.message ||
              'Verifique se a API está ligada e se o login continua válido.'}
          </p>
          <Button className="mt-4" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="Nenhum bubalino encontrado"
          description={
            bubalinos.length === 0
              ? 'Não há bubalinos ativos associados às coleiras deste usuário.'
              : 'Nenhum animal corresponde à busca ou ao filtro selecionado.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {[
                    'Etiqueta',
                    'Raça',
                    'Idade',
                    'Sexo',
                    'Coleira',
                    'Temperatura',
                    'Batimentos',
                    'Estresse',
                  ].map((titulo) => (
                    <th
                      key={titulo}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {titulo}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.map((animal) => (
                  <tr
                    key={animal.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold">
                        {animal.numero_etiqueta || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {animal.nome}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {animal.raca || '—'}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                      {animal.idade}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatarSexo(animal.sexo)}
                    </td>

                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div>{animal.coleira_nome || '—'}</div>
                      <div className="text-xs">
                        {animal.coleira_localizacao || ''}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <Thermometer className="h-4 w-4 text-amber-400" />
                        {animal.temperatura == null
                          ? '—'
                          : `${animal.temperatura} °C`}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1">
                        <HeartPulse className="h-4 w-4 text-rose-400" />
                        {animal.batimentos == null
                          ? '—'
                          : `${animal.batimentos} bpm`}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <StatusBadge status={animal.status} />
                        <div className="text-xs text-muted-foreground">
                          {animal.estado_estresse}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
            Exibindo {filtered.length} de {bubalinos.length} bubalino(s).
            {isFetching ? ' Atualizando dados...' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
