import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Thermometer, Heart, Clock, MapPin, RefreshCw, Satellite } from 'lucide-react';

import { useColeiras } from '@/hooks/useColeiras';
import { STATUS, formatarDataHora, mensagemDeErro } from '@/lib/rebanho';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const centroPadrao = [-1.4558, -48.4902];

const legenda = ['saudavel', 'estressado', 'sem_classificacao', 'sem_conexao'];

function criarIcone(status, selecionado) {
  const cor = STATUS[status]?.color || '#6B7A84';
  const tamanho = selecionado ? 40 : 32;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:${tamanho}px;height:${tamanho}px;border-radius:50% 50% 50% 0;background:${cor};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.5)${selecionado ? `,0 0 0 6px ${cor}55` : ''}"><div style="transform:rotate(45deg);font-size:12px;color:#fff;font-weight:800;font-family:Fredoka,sans-serif">B</div></div>`,
    iconSize: [tamanho, tamanho],
    iconAnchor: [tamanho / 2, tamanho],
    popupAnchor: [0, -tamanho],
  });
}

// Move o mapa até o animal escolhido na lista.
function VoarPara({ animal }) {
  const mapa = useMap();

  React.useEffect(() => {
    if (animal) mapa.flyTo([animal.latitude, animal.longitude], 17, { duration: 0.8 });
  }, [animal, mapa]);

  return null;
}

export default function Localizacao() {
  const [selecionadoId, setSelecionadoId] = useState(null);
  const { usuarioId, bubalinos, isLoading, isError, error, refetch, isFetching } = useColeiras({
    atualizarAutomaticamente: true,
  });

  const comLocalizacao = bubalinos.filter((a) => a.latitude !== null && a.longitude !== null);
  const selecionado = comLocalizacao.find((a) => a.id === selecionadoId) || null;
  const centro = comLocalizacao.length ? [comLocalizacao[0].latitude, comLocalizacao[0].longitude] : centroPadrao;

  const contagem = (status) => bubalinos.filter((a) => a.status === status).length;

  if (!usuarioId) {
    return (
      <ErrorState title="Não foi possível identificar o usuário" message="Saia da conta e entre novamente." />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Localização"
        description="Acompanhe a posição de cada bubalino. O mapa atualiza a cada 30 segundos."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : ''} />
            Atualizar
          </Button>
        }
      />

      {isError && (
        <ErrorState
          title="Não foi possível carregar a localização"
          message={mensagemDeErro(error, 'Verifique se a API está funcionando e se você está autenticado.')}
          onRetry={() => refetch()}
        />
      )}

      <ul className="flex flex-wrap gap-2.5" aria-label="Legenda do mapa">
        {legenda.map((status) => (
          <li key={status} className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS[status].color }} />
            <span className="text-sm text-muted-foreground">{STATUS[status].label}</span>
            <span className="font-display text-sm font-semibold">{contagem(status)}</span>
          </li>
        ))}
      </ul>

      {isLoading ? (
        <Skeleton className="h-[520px] rounded-xl" />
      ) : comLocalizacao.length === 0 && !isError ? (
        <EmptyState
          icon={Satellite}
          title="Sem coordenadas GPS"
          description="A API ainda não retornou posições válidas para os seus bubalinos. Os marcadores aparecerão assim que houver dados de localização."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="surface order-2 max-h-[560px] overflow-y-auto p-2 lg:order-1" aria-label="Animais no mapa">
            <ul className="space-y-1">
              {comLocalizacao.map((animal) => (
                <li key={animal.id}>
                  <button
                    type="button"
                    onClick={() => setSelecionadoId(animal.id)}
                    aria-pressed={selecionadoId === animal.id}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      selecionadoId === animal.id ? 'bg-primary/15' : 'hover:bg-muted'
                    )}
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS[animal.status]?.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-base font-semibold">
                        {animal.numero_etiqueta}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {STATUS[animal.status]?.label}
                        {animal.raca ? ` · ${animal.raca}` : ''}
                      </span>
                    </span>
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="surface order-1 h-[520px] overflow-hidden lg:order-2 lg:h-[560px]">
            <MapContainer center={centro} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <TileLayer
                className="map-dark-tiles"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <VoarPara animal={selecionado} />

              {comLocalizacao.map((animal) => (
                <Marker
                  key={animal.id}
                  position={[animal.latitude, animal.longitude]}
                  icon={criarIcone(animal.status, animal.id === selecionadoId)}
                  eventHandlers={{ click: () => setSelecionadoId(animal.id) }}
                >
                  <Popup>
                    <div className="min-w-[210px] space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-base font-semibold">{animal.numero_etiqueta}</h3>
                          <p className="text-xs text-muted-foreground">
                            {animal.raca || 'Raça não informada'} · Coleira {animal.coleira_nome}
                          </p>
                        </div>
                      </div>

                      <StatusBadge status={animal.status} />

                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-warning" />
                          {animal.temperatura != null ? `${animal.temperatura} °C` : 'Temperatura indisponível'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-danger" />
                          {animal.batimentos != null ? `${animal.batimentos} bpm` : 'Batimentos indisponíveis'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {animal.latitude.toFixed(5)}, {animal.longitude.toFixed(5)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {formatarDataHora(animal.data_leitura) || 'Sem data de telemetria'}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}