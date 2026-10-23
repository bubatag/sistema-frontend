
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Thermometer,
  Heart,
  Clock,
  MapPin,
  RefreshCw,
} from 'lucide-react';

import { api } from '@/services/api';
import { useAuth } from '@/lib/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusColors = {
  saudavel: '#06D001',
  estressado: '#E63946',
  fora_do_pasto: '#FFB703',
  sem_conexao: '#666666',
};

const pastureCenter = [-1.4558, -48.4902];
const pastureRadius = 500;

function createCustomIcon(status) {
  const color = statusColors[status] || '#666666';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:32px;height:32px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      display:flex;align-items:center;justify-content:center;
      border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.4);
    "><div style="transform:rotate(45deg);font-size:12px;color:white;font-weight:bold">B</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function parseCoordinate(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getLocation(bubalino) {
  const locations = Array.isArray(bubalino.localizacao)
    ? bubalino.localizacao
    : [];

  const location = [...locations]
    .reverse()
    .find((item) => item.ativo !== false) || locations.at(-1);

  if (!location) return null;

  const latitude = parseCoordinate(location.latitude);
  const longitude = parseCoordinate(location.longitude);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    data: location.data || location.data_localizacao || null,
  };
}

function getLatestTelemetry(bubalino) {
  const readings = Array.isArray(bubalino.dados) ? bubalino.dados : [];

  return [...readings].sort(
    (a, b) =>
      new Date(b.data || 0).getTime() -
      new Date(a.data || 0).getTime()
  )[0] || {};
}

function getStressStatus(bubalino) {
  const history = Array.isArray(bubalino.historico_estresse)
    ? bubalino.historico_estresse
    : [];

  const latest = [...history]
    .filter((item) => item.ativo !== false)
    .sort(
      (a, b) =>
        new Date(b.data_estresse || 0).getTime() -
        new Date(a.data_estresse || 0).getTime()
    )[0];

  const status = String(latest?.data_estresse || '').toLowerCase();

  if (status.includes('crítico') || status.includes('critico')) {
    return 'estressado';
  }

  if (
    status.includes('estressado') ||
    status.includes('térmico') ||
    status.includes('termico') ||
    status.includes('alerta')
  ) {
    return 'estressado';
  }

  return 'saudavel';
}

function normalizeBubalino(bubalino, coleira) {
  const location = getLocation(bubalino);
  const telemetry = getLatestTelemetry(bubalino);

  return {
    id: bubalino._id || bubalino.n_etiqueta,
    nome: bubalino.n_etiqueta || 'Bubalino sem etiqueta',
    raca: bubalino.raca || 'Não informada',
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    dataLocalizacao: location?.data,
    temperatura: telemetry.temperatura ?? null,
    batimentos: telemetry.batimento_cardiaco ?? null,
    dataTelemetria: telemetry.data || null,
    status: getStressStatus(bubalino),
    coleira: coleira.n_coleira || '—',
  };
}

export default function Localizacao() {
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
    data: bubalinos = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['localizacao-bubalinos', usuarioId],
    enabled: Boolean(usuarioId),
    queryFn: async () => {
      const response = await api.get(
        `/api/coleiras/usuario/${usuarioId}`
      );

      const body = response.data;
      const coleiras = Array.isArray(body)
        ? body
        : body.coleiras || body.data || [];

      return coleiras
        .filter((coleira) => coleira.bubalino)
        .map((coleira) =>
          normalizeBubalino(coleira.bubalino, coleira)
        );
    },
    refetchInterval: 30000,
  });

  const animalsWithLocation = bubalinos.filter(
    (animal) =>
      animal.latitude !== null && animal.longitude !== null
  );

  const center = animalsWithLocation.length
    ? [
        animalsWithLocation[0].latitude,
        animalsWithLocation[0].longitude,
      ]
    : pastureCenter;

  const counts = {
    saudavel: bubalinos.filter((b) => b.status === 'saudavel').length,
    estressado: bubalinos.filter((b) => b.status === 'estressado').length,
    fora_do_pasto: 0,
    sem_conexao: bubalinos.filter((b) => !b.dataTelemetria).length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Localização
          </h1>
          <p className="mt-1 text-muted-foreground">
            Rastreamento dos bubalinos cadastrados na API
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
          Atualizar
        </Button>
      </div>

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-card p-5">
          <p className="font-medium text-destructive">
            Não foi possível carregar os dados de localização.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error?.response?.data?.mensagem ||
              error?.message ||
              'Verifique se a API está funcionando e se você está autenticado.'}
          </p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {!usuarioId && (
        <div className="rounded-xl border border-border bg-card p-5">
          Não foi possível identificar o usuário. Entre novamente no sistema.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Saudável', count: counts.saudavel, color: '#06D001' },
          { label: 'Estressado', count: counts.estressado, color: '#E63946' },
          { label: 'Fora do pasto', count: counts.fora_do_pasto, color: '#FFB703' },
          { label: 'Sem sinal', count: counts.sem_conexao, color: '#666666' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">
              {item.label}:
            </span>
            <span className="text-sm font-semibold">{item.count}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] rounded-xl bg-card md:h-[600px]" />
      ) : (
        <div
          className="overflow-hidden rounded-xl border border-border"
          style={{ height: 600 }}
        >
          <MapContainer
            key={`${center[0]}-${center[1]}`}
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Circle
              center={center}
              radius={pastureRadius}
              pathOptions={{
                color: '#90A955',
                weight: 2,
                fillColor: '#90A955',
                fillOpacity: 0.05,
                dashArray: '8 4',
              }}
            />

            {animalsWithLocation.map((animal) => (
              <Marker
                key={animal.id}
                position={[animal.latitude, animal.longitude]}
                icon={createCustomIcon(animal.status)}
              >
                <Popup>
                  <div className="min-w-[200px] space-y-3 p-1">
                    <h3 className="font-bold">
                      {animal.nome}
                    </h3>

                    <p className="text-sm">
                      Raça: {animal.raca}
                    </p>

                    <p className="text-sm">
                      Coleira: {animal.coleira}
                    </p>

                    <StatusBadge status={animal.status} />

                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">
                        {animal.temperatura != null
                          ? `${animal.temperatura} °C`
                          : 'Temperatura indisponível'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        {animal.batimentos != null
                          ? `${animal.batimentos} bpm`
                          : 'Batimentos indisponíveis'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-xs">
                        {animal.latitude.toFixed(5)},{' '}
                        {animal.longitude.toFixed(5)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">
                        {animal.dataTelemetria
                          ? new Date(animal.dataTelemetria).toLocaleString('pt-BR')
                          : 'Sem data de telemetria'}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {!isLoading && !isError && animalsWithLocation.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <MapPin className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            Sem coordenadas GPS
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A API não retornou coordenadas válidas para os bubalinos deste usuário.
            Os marcadores só aparecerão quando houver dados de localização.
          </p>
        </div>
      )}
    </div>
  );
}
