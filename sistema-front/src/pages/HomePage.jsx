import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bug, Radio, Heart, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { api } from '@/services/api';

import KpiCard from '@/components/shared/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {

  const { data: bubalinos = [], isLoading: loadingB } = useQuery({
    queryKey: ['bubalinos'],
    queryFn: async () => {
      const response = await api.get('/bubalinos');
      return response.data;
    },
  });

  const { data: coleiras = [], isLoading: loadingC } = useQuery({
    queryKey: ['coleiras'],
    queryFn: async () => {
      const response = await api.get('/coleiras');
      return response.data;
    },
  });

  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    async function loadUser() {
      try {
        const response = await api.get('/auth/me');
        setUserName(response.data.full_name || 'Produtor');
      } catch {
        setUserName('Produtor');
      }
    }

    loadUser();
  }, []);

  const saudaveis = bubalinos.filter(
    (b) => b.status === 'saudavel'
  ).length;

  const alertas = bubalinos.filter(
    (b) => b.status && b.status !== 'saudavel'
  ).length;

  const isLoading = loadingB || loadingC;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Bem-vindo ao <span className="text-primary">BUBATAG</span>
        </h1>

        <p className="text-muted-foreground text-lg">
          Olá, {userName}! Acompanhe o rebanho em tempo real.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <KpiCard
            title="Total de Bubalinos"
            value={bubalinos.length}
            icon={Bug}
            trend={5}
            trendLabel="este mês"
          />

          <KpiCard
            title="Total de Coleiras"
            value={coleiras.length}
            icon={Radio}
            accentColor="text-[#06D001]"
            bgAccent="bg-[#06D001]/10"
          />

          <KpiCard
            title="Bubalinos Saudáveis"
            value={saudaveis}
            icon={Heart}
            accentColor="text-[#06D001]"
            bgAccent="bg-[#06D001]/10"
          />

          <KpiCard
            title="Alertas Ativos"
            value={alertas}
            icon={AlertTriangle}
            accentColor="text-[#FFB703]"
            bgAccent="bg-[#FFB703]/10"
          />

        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {[
          {
            title: 'Gerenciar Bubalinos',
            desc: 'Cadastre, edite e monitore seus animais',
            path: '/bubalinos',
            icon: Bug,
            color: 'text-primary',
            bg: 'bg-primary/10'
          },

          {
            title: 'Coleiras IoT',
            desc: 'Gerencie coleiras inteligentes do rebanho',
            path: '/coleiras',
            icon: Radio,
            color: 'text-[#06D001]',
            bg: 'bg-[#06D001]/10'
          },

          {
            title: 'Mapa em Tempo Real',
            desc: 'Veja a localização de cada animal no pasto',
            path: '/localizacao',
            icon: ArrowRight,
            color: 'text-[#FFB703]',
            bg: 'bg-[#FFB703]/10'
          },

        ].map((card) => (
          <Link
            key={card.path}
            to={card.path}
            className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all duration-300 group"
          >

            <div
              className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>

            <h3 className="font-semibold text-lg mb-1">
              {card.title}
            </h3>

            <p className="text-sm text-muted-foreground">
              {card.desc}
            </p>

          </Link>
        ))}

      </div>
    </div>
  );
}