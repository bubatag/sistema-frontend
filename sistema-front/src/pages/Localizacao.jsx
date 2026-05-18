import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/shared/StatusBadge';
import { Thermometer, Heart, Clock, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusColors = {
  saudavel: '#06D001',
  estressado: '#FFB703',
  fora_do_pasto: '#E63946',
  sem_conexao: '#666666',
};

function createCustomIcon(status) {
  const color = statusColors[status] || '#666666';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
      background: ${color}; transform: rotate(-45deg);
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    "><div style="transform: rotate(45deg); font-size: 12px;">B</div></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const pastureCenter = [-1.4558, -48.4902];
const pastureRadius = 500;

export default function Localizacao() {
  const { data: bubalinos = [], isLoading } = useQuery({
    queryKey: ['bubalinos'],
    queryFn: () => base44.entities.Bubalino.list(),
  });

  const animalsWithLocation = bubalinos.filter((b) => b.latitude && b.longitude);
  const center = animalsWithLocation.length > 0
    ? [animalsWithLocation[0].latitude, animalsWithLocation[0].longitude]
    : pastureCenter;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Localizacao</h1>
        <p className="text-muted-foreground mt-1">Rastreamento em tempo real do rebanho</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'No mapa', count: animalsWithLocation.length, color: '#06D001' },
          { label: 'Fora do pasto', count: bubalinos.filter((b) => b.status === 'fora_do_pasto').length, color: '#E63946' },
          { label: 'Sem sinal', count: bubalinos.filter((b) => b.status === 'sem_conexao').length, color: '#666' },
        ].map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-sm text-muted-foreground">{s.label}:</span>
            <span className="text-sm font-semibold">{s.count}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-[500px] md:h-[600px] rounded-xl bg-card" />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden" style={{ height: '600px' }}>
          <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <Circle
              center={pastureCenter}
              radius={pastureRadius}
              pathOptions={{ color: '#90A955', weight: 2, fillColor: '#90A955', fillOpacity: 0.05, dashArray: '8 4' }}
            />

            {animalsWithLocation.map((b) => (
              <Marker key={b.id} position={[b.latitude, b.longitude]} icon={createCustomIcon(b.status)}>
                <Popup>
                  <div className="min-w-[200px] space-y-3 p-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-white">{b.nome}</h3>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="w-3.5 h-3.5 text-[#FFB703]" />
                        <span className="text-xs text-gray-300">{b.temperatura ? `${b.temperatura}°C` : '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#E63946]" />
                        <span className="text-xs text-gray-300">{b.batimentos ? `${b.batimentos} bpm` : '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#90A955]" />
                        <span className="text-xs text-gray-300">{b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-300">Agora</span>
                      </div>
                    </div>
                    {b.status === 'fora_do_pasto' && (
                      <div className="bg-[#E63946]/20 border border-[#E63946]/40 rounded-lg px-2 py-1.5 text-xs text-[#E63946] font-medium text-center">
                        Alerta: animal fora do perimetro
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {animalsWithLocation.length === 0 && !isLoading && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-lg">Sem dados de localizacao</h3>
          <p className="text-sm text-muted-foreground mt-1">Nenhum bubalino possui coordenadas GPS cadastradas.</p>
        </div>
      )}
    </div>
  );
}
