
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CalendarDays,
  Clock,
  HeartPulse,
  MapPin,
  RefreshCw,
  Thermometer,
  TrendingUp,
} from 'lucide-react';

import { api } from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { useColeiras } from '@/hooks/useColeiras';
import { formatarDataHora, mensagemDeErro } from '@/lib/rebanho';

import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from '@/components/shared/ErrorState';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PERIODOS = [
  { label: '7 dias', value: '7' },
  { label: '30 dias', value: '30' },
  { label: '90 dias', value: '90' },
  { label: 'Todo o histórico', value: 'all' },
];

function normalizarRegistros(payload) {
  const candidatos = [
    payload,
    payload?.registros,
    payload?.dados,
    payload?.historico,
    payload?.data,
    payload?.relatorio?.registros,
    payload?.relatorio?.dados,
    payload?.relatorio?.historico,
  ];

  const lista = candidatos.find(Array.isArray) || [];

  return lista
    .map((item, indice) => {
      const data = item.data
        || item.data_registro
        || item.createdAt
        || item.timestamp;

      const localizacao = item.localizacao || {};

      return {
        id: item._id || item.id || `${data}-${indice}`,
        data,
        temperatura: numero(
          item.temperatura
        ),
        batimentos: numero(
          item.batimento_cardiaco
          ?? item.batimentos
          ?? item.frequencia_cardiaca
          ?? item.bpm
        ),
        estado: item.status_estresse
          || item.estado_estresse
          || item.estado
          || item.status
          || item.nivel_alerta,
        motivo: item.motivo_estresse
          || item.causa
          || item.mensagem
          || '',
        latitude: numero(
          item.latitude ?? localizacao.latitude
        ),
        longitude: numero(
          item.longitude ?? localizacao.longitude
        ),
      };
    })
    .filter((item) => item.data && !Number.isNaN(new Date(item.data).getTime()))
    .sort((a, b) => new Date(a.data) - new Date(b.data));
}

function numero(valor) {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const convertido = Number(valor);

  return Number.isFinite(convertido) ? convertido : null;
}

function identificarStatus(estado) {
  const valor = String(estado || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (
    valor.includes('estress')
    || valor.includes('alerta')
    || valor.includes('critico')
    || valor.includes('alto')
  ) {
    return 'estressado';
  }

  if (
    valor.includes('saudavel')
    || valor.includes('normal')
  ) {
    return 'saudavel';
  }

  return 'sem_classificacao';
}

function Indicador({
  titulo,
  valor,
  unidade,
  icon: Icon,
  cor,
  descricao,
}) {
  return (
    <div className="surface p-4 md:p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {titulo}
        </span>

        <div className="rounded-lg bg-muted p-2">
          <Icon className={`h-5 w-5 ${cor}`} />
        </div>
      </div>

      <div className="mt-3 font-display text-3xl font-semibold">
        {valor == null ? '—' : `${valor} ${unidade}`}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {descricao}
      </p>
    </div>
  );
}

function Grafico({
  titulo,
  descricao,
  registros,
  campo,
  unidade,
  cor,
}) {
  const pontos = registros.filter(
    (item) => item[campo] !== null
  );

  if (!pontos.length) {
    return (
      <section className="surface p-5">
        <h2 className="font-semibold">{titulo}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {descricao}
        </p>

        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          Não existem leituras para este período.
        </div>
      </section>
    );
  }

  const valores = pontos.map((p) => p[campo]);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const margem = Math.max((maximo - minimo) * 0.2, 1);

  const limiteMin = minimo - margem;
  const limiteMax = maximo + margem;

  const coordenadas = pontos.map((ponto, indice) => {
    const x = pontos.length === 1
      ? 50
      : 5 + (indice / (pontos.length - 1)) * 90;

    const y = 95 - (
      ((ponto[campo] - limiteMin) / (limiteMax - limiteMin)) * 80
    );

    return { x, y, valor: ponto[campo] };
  });

  const linha = coordenadas
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <section className="surface min-w-0 p-5">
      <div className="mb-4">
        <h2 className="font-semibold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">
          {descricao}
        </p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: cor }}
        />
        <span className="font-semibold">
          {maximo.toFixed(1)} {unidade}
        </span>
        <span className="text-xs text-muted-foreground">
          Maior leitura no período
        </span>
      </div>

      <svg
        viewBox="0 0 100 105"
        className="mt-4 h-48 w-full overflow-visible"
        role="img"
        aria-label={`Gráfico de ${titulo}`}
      >
        {[15, 40, 65, 90].map((y) => (
          <line
            key={y}
            x1="5"
            y1={y}
            x2="95"
            y2={y}
            stroke="currentColor"
            opacity="0.12"
            strokeDasharray="2 2"
          />
        ))}

        <polyline
          points={linha}
          fill="none"
          stroke={cor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {coordenadas.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill={cor}
          >
            <title>{`${p.valor} ${unidade}`}</title>
          </circle>
        ))}
      </svg>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {formatarDataHora(pontos[0].data)}
        </span>
        <span>
          {formatarDataHora(pontos[pontos.length - 1].data)}
        </span>
      </div>
    </section>
  );
}

export default function Historico() {
  const [animalId, setAnimalId] = useState('');
  const [periodo, setPeriodo] = useState('30');

  const {
    usuarioId,
    bubalinos,
    isLoading,
    isError: erroBubalinos,
    error: erroLista,
    refetch: atualizarBubalinos,
  } = useColeiras();

  const animaisDisponiveis = bubalinos.filter(
    (animal) => animal.coleira_nome && animal.coleira_nome !== '—'
  );

  const animal = animaisDisponiveis.find(
    (item) => String(item.id) === animalId
  ) || animaisDisponiveis[0] || null;

  const consultaHistorico = useQuery({
    queryKey: [
      'historico',
      usuarioId,
      animal?.coleira_nome,
    ],

    enabled: Boolean(usuarioId && animal?.coleira_nome),

    queryFn: async () => {
      const resposta = await api.get(
        ENDPOINTS.relatorios.historicoColeira(
          animal.coleira_nome
        )
      );

      return normalizarRegistros(resposta.data);
    },

    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const registros = consultaHistorico.data || [];

  const registrosFiltrados = useMemo(() => {
    if (periodo === 'all') return registros;

    const limite = new Date();
    limite.setDate(limite.getDate() - Number(periodo));

    return registros.filter(
      (item) => new Date(item.data) >= limite
    );
  }, [registros, periodo]);

  const ultimoRegistro = registrosFiltrados.at(-1);

  const ultimaTemperatura = ultimoRegistro?.temperatura;
  const ultimosBatimentos = ultimoRegistro?.batimentos;

  const quantidadeAlertas = registrosFiltrados.filter(
    (item) => identificarStatus(item.estado) === 'estressado'
  ).length;

  if (!usuarioId) {
    return (
      <ErrorState
        title="Não foi possível identificar o usuário"
        message="Saia da conta e entre novamente."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico"
        description="Acompanhe a evolução dos sinais vitais e os registros individuais dos seus bubalinos."
        actions={
          <Button
            variant="outline"
            onClick={() => consultaHistorico.refetch()}
            disabled={consultaHistorico.isFetching || !animal}
          >
            <RefreshCw
              className={
                consultaHistorico.isFetching
                  ? 'animate-spin'
                  : ''
              }
            />
            Atualizar
          </Button>
        }
      />

      {erroBubalinos && (
        <ErrorState
          title="Não foi possível carregar os animais"
          message={mensagemDeErro(
            erroLista,
            'Verifique a conexão com a API.'
          )}
          onRetry={atualizarBubalinos}
        />
      )}

      {isLoading ? (
        <div className="surface h-24 animate-pulse" />
      ) : (
        <>
          <section className="surface p-4 md:p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">
                Animal selecionado
              </h2>
            </div>

            <Select
              value={animal ? String(animal.id) : ''}
              onValueChange={setAnimalId}
              disabled={!animaisDisponiveis.length}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Selecione um bubalino" />
              </SelectTrigger>

              <SelectContent>
                {animaisDisponiveis.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={String(item.id)}
                  >
                    {item.numero_etiqueta} — {item.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {animal && (
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span>
                  Coleira: {animal.coleira_nome}
                </span>

                <span>
                  Raça: {animal.raca || 'Não informada'}
                </span>

                <span>
                  Identificação: {animal.numero_etiqueta}
                </span>
              </div>
            )}
          </section>

          {!animal ? (
            <EmptyState
              icon={Activity}
              title="Nenhum animal com coleira vinculada"
              description="Cadastre um bubalino e vincule uma coleira para consultar o histórico de monitoramento."
            />
          ) : consultaHistorico.isPending ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface h-28 animate-pulse" />
              <div className="surface h-28 animate-pulse" />
            </div>
          ) : consultaHistorico.isError ? (
            <ErrorState
              title="Não foi possível carregar o histórico"
              message={mensagemDeErro(
                consultaHistorico.error,
                'Verifique a rota de relatórios da API.'
              )}
              onRetry={() => consultaHistorico.refetch()}
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Resumo do monitoramento
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    {registrosFiltrados.length} registro(s) encontrados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />

                  <Select
                    value={periodo}
                    onValueChange={setPeriodo}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {PERIODOS.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Indicador
                  titulo="Temperatura"
                  valor={ultimaTemperatura}
                  unidade="°C"
                  icon={Thermometer}
                  cor="text-warning"
                  descricao="Última leitura do período"
                />

                <Indicador
                  titulo="Batimentos cardíacos"
                  valor={ultimosBatimentos}
                  unidade="bpm"
                  icon={HeartPulse}
                  cor="text-danger"
                  descricao="Última leitura do período"
                />

                <Indicador
                  titulo="Registros"
                  valor={registrosFiltrados.length}
                  unidade=""
                  icon={Activity}
                  cor="text-primary"
                  descricao="Leituras disponíveis"
                />

                <Indicador
                  titulo="Alertas de estresse"
                  valor={quantidadeAlertas}
                  unidade=""
                  icon={TrendingUp}
                  cor="text-warning"
                  descricao="Registros classificados em alerta"
                />
              </div>

              {registrosFiltrados.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="Nenhum registro neste período"
                  description="Não foram encontradas medições para o intervalo selecionado. Experimente ampliar o período."
                />
              ) : (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Grafico
                      titulo="Temperatura corporal"
                      descricao="Variação da temperatura ao longo do período."
                      registros={registrosFiltrados}
                      campo="temperatura"
                      unidade="°C"
                      cor="#E5B34C"
                    />

                    <Grafico
                      titulo="Frequência cardíaca"
                      descricao="Variação dos batimentos cardíacos."
                      registros={registrosFiltrados}
                      campo="batimentos"
                      unidade="bpm"
                      cor="#FF6874"
                    />
                  </div>

                  <section className="surface p-4 md:p-5">
                    <div className="mb-5">
                      <h2 className="text-lg font-semibold">
                        Linha do tempo
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        Registros de monitoramento do animal.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[...registrosFiltrados]
                        .reverse()
                        .map((item) => {
                          const status = identificarStatus(item.estado);

                          return (
                            <article
                              key={item.id}
                              className="rounded-lg border border-border bg-background/40 p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Clock className="h-4 w-4" />
                                  </div>

                                  <div>
                                    <p className="text-sm font-semibold">
                                      {formatarDataHora(item.data)}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      Registro de telemetria
                                    </p>
                                  </div>
                                </div>

                                <StatusBadge status={status} />
                              </div>

                              <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-muted/50 p-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Thermometer className="h-4 w-4 text-warning" />
                                    Temperatura
                                  </div>

                                  <p className="mt-1 font-semibold">
                                    {item.temperatura != null
                                      ? `${item.temperatura} °C`
                                      : 'Indisponível'}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-muted/50 p-3">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <HeartPulse className="h-4 w-4 text-danger" />
                                    Batimentos
                                  </div>

                                  <p className="mt-1 font-semibold">
                                    {item.batimentos != null
                                      ? `${item.batimentos} bpm`
                                      : 'Indisponível'}
                                  </p>
                                </div>
                              </div>

                              {item.motivo && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                  Observação: {item.motivo}
                                </p>
                              )}

                              {item.latitude != null && item.longitude != null && (
                                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="h-4 w-4 text-primary" />

                                  {item.latitude}, {item.longitude}
                                </div>
                              )}
                            </article>
                          );
                        })}
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
