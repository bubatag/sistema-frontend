
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bug, Thermometer, Radio } from 'lucide-react';

import { api } from '@/services/api';
import { useAuth } from '@/lib/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import KpiCard from '@/components/shared/KpiCard';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

function obterLista(responseData, propriedade) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.[propriedade])) {
    return responseData[propriedade];
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.value)) {
    return responseData.value;
  }

  return [];
}

function obterUltimoRegistro(registros = [], campoData = 'data') {
  if (!Array.isArray(registros) || registros.length === 0) {
    return null;
  }

  const ativos = registros.filter(
    (registro) => registro.ativo !== false
  );

  const lista = ativos.length ? ativos : registros;

  return [...lista].sort((a, b) => {
    const dataA = new Date(a[campoData] || 0).getTime();
    const dataB = new Date(b[campoData] || 0).getTime();

    return dataB - dataA;
  })[0];
}

function normalizarEstado(estado, possuiLeitura = false) {
  const valor = String(estado || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (['normal', 'ocioso', 'saudavel'].includes(valor)) {
    return 'saudavel';
  }

  if (
    valor === 'alerta' ||
    valor === 'estressado' ||
    valor.includes('estresse') ||
    valor.includes('termico')
  ) {
    return 'estressado';
  }

  // Não confundir ausência de classificação com ausência de conexão.
  // Se existem dados, mas não há classificação, não inventamos um estado.
  return possuiLeitura ? 'sem_classificacao' : 'sem_conexao';
}

export default function Dashboard() {
  const { user } = useAuth();

  const usuario = user || (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null');
    } catch {
      return null;
    }
  })();

  const usuarioId = usuario?._id || usuario?.id;

  const {
    data: coleirasOriginais = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard-coleiras', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const response = await api.get(
        `/api/coleiras/usuario/${usuarioId}`
      );

      return obterLista(response.data, 'coleiras');
    },
    refetchInterval: 30000,
  });

  const coleiras = coleirasOriginais.map((coleira) => ({
    id: coleira._id || coleira.n_coleira,
    numero_etiqueta: coleira.n_coleira || '—',
    status: coleira.ativo !== false ? 'ativa' : 'inativa',
    bateria: null,
    bubalino_nome:
      coleira.bubalino?.n_etiqueta || 'Sem animal associado',
    bubalino_id: coleira.bubalino?._id,
  }));

  const bubalinos = coleirasOriginais
    .filter((coleira) => coleira.bubalino)
    .map((coleira) => {
      const bubalino = coleira.bubalino;

      const ultimoDado = obterUltimoRegistro(
        bubalino.dados,
        'data'
      );

      const ultimaLocalizacao = obterUltimoRegistro(
        bubalino.localizacao,
        'data'
      );

      const ultimoEstresse = obterUltimoRegistro(
        bubalino.historico_estresse,
        'data_estresse'
      );

      // data_estresse é a data do registro; estado_estresse é a classificação.
      const estadoEstresse =
        ultimoEstresse?.estado_estresse || null;

      const possuiLeitura =
        ultimoDado !== null ||
        ultimaLocalizacao !== null ||
        ultimoEstresse !== null;

      return {
        id: bubalino._id || bubalino.n_etiqueta,
        nome: `Bubalino ${bubalino.n_etiqueta || ''}`.trim(),
        numero_etiqueta: bubalino.n_etiqueta || '—',
        raca: bubalino.raca || 'Não informada',
        sexo: bubalino.sexo || 'Não informado',
        status: normalizarEstado(estadoEstresse, possuiLeitura),
        temperatura: ultimoDado?.temperatura ?? null,
        batimentos: ultimoDado?.batimento_cardiaco ?? null,
        coleira_id: coleira._id,
        latitude: ultimaLocalizacao?.latitude ?? null,
        longitude: ultimaLocalizacao?.longitude ?? null,
        estado_estresse: estadoEstresse || 'Sem classificação',
        ativo: bubalino.ativo !== false,
      };
    });

  const temperaturas = bubalinos
    .map((bubalino) => Number(bubalino.temperatura))
    .filter((temperatura) => Number.isFinite(temperatura));

  const tempMedia = temperaturas.length
    ? (
        temperaturas.reduce((soma, temperatura) => soma + temperatura, 0) /
        temperaturas.length
      ).toFixed(1)
    : '—';

  const coleirasAtivas = coleirasOriginais.filter(
    (coleira) => coleira.ativo !== false
  ).length;

  if (!usuarioId) {
    return (
      <div className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Não foi possível identificar o usuário. Saia da conta e entre novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Visão geral do seu rebanho
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-50"
        >
          {isFetching ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </div>

      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          Não foi possível carregar os dados da API.{' '}
          {error?.response?.status === 401
            ? 'Sua sessão pode ter expirado. Entre novamente.'
            : error?.response?.status === 403
              ? 'O usuário não tem permissão para consultar esses dados.'
              : error?.response?.data?.mensagem ||
                'Verifique se a API está funcionando e tente novamente.'}

          <button
            type="button"
            onClick={() => refetch()}
            className="ml-2 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton
              key={item}
              className="h-32 rounded-xl bg-card"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            title="Bubalinos Cadastrados"
            value={bubalinos.length}
            icon={Bug}
          />

          <KpiCard
            title="Temp. Média do Rebanho"
            value={`${tempMedia}${tempMedia === '—' ? '' : '°C'}`}
            icon={Thermometer}
            accentColor="text-[#FFB703]"
            bgAccent="bg-[#FFB703]/10"
          />

          <KpiCard
            title="Coleiras Ativas"
            value={coleirasAtivas}
            icon={Radio}
            accentColor="text-[#06D001]"
            bgAccent="bg-[#06D001]/10"
          />
        </div>
      )}

      {!isLoading && !isError && bubalinos.length === 0 && (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <p className="font-medium">Nenhum bubalino cadastrado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Quando houver animais associados às coleiras deste usuário,
            eles aparecerão aqui.
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <DashboardCharts
          bubalinos={bubalinos}
          coleiras={coleiras}
        />
      )}
    </div>
  );
}
