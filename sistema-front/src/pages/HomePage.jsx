import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bug, Radio, Heart, AlertTriangle, ArrowRight, CheckCircle2, Thermometer, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { base44 } from '@/api/base44Client';

import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import KpiCard from '@/components/shared/KpiCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [alertsOpen, setAlertsOpen] = React.useState(false);
  const [alertToResolve, setAlertToResolve] = React.useState(null);
  const queryClient = useQueryClient();

  const { data: bubalinos = [], isLoading: loadingB } = useQuery({
    queryKey: ['bubalinos'],
    queryFn: () => base44.entities.Bubalino.list(),
  });

  const { data: coleiras = [], isLoading: loadingC } = useQuery({
    queryKey: ['coleiras'],
    queryFn: () => base44.entities.Coleira.list(),
  });

  const [userName, setUserName] = React.useState('');

  React.useEffect(() => {
    async function loadUser() {
      try {
        const user = await base44.auth.me();
        setUserName(user.full_name || user.email || '');
      } catch {
        setUserName('');
      }
    }

    loadUser();
  }, []);

  const saudaveis = bubalinos.filter(
    (b) => b.status === 'saudavel'
  ).length;

  const activeAlerts = bubalinos.filter(
    (b) => b.status && b.status !== 'saudavel'
  );

  const alertas = activeAlerts.length;

  const isLoading = loadingB || loadingC;

  const resolveAlertMutation = useMutation({
    mutationFn: (bubalino) => base44.entities.Bubalino.update(bubalino.id, {
      status: 'saudavel',
      temperatura: bubalino.temperatura || 38.2,
      batimentos: bubalino.batimentos || 60,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bubalinos'] });
      setAlertToResolve(null);
    },
  });

  const getAlertTitle = (status) => {
    const labels = {
      estressado: 'Sinais de estresse',
      fora_do_pasto: 'Fora do pasto',
      sem_conexao: 'Sem conexao',
    };

    return labels[status] || 'Alerta ativo';
  };

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
            onClick={() => setAlertsOpen(true)}
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

      {alertsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold">Alertas ativos</h2>
                <p className="text-sm text-muted-foreground">
                  {alertas ? `${alertas} ocorrencia(s) aguardando resolucao` : 'Nenhum alerta ativo no momento'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAlertsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              {activeAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-background/40 p-8 text-center">
                  <CheckCircle2 className="mb-3 h-10 w-10 text-[#06D001]" />
                  <h3 className="font-semibold">Tudo resolvido</h3>
                  <p className="mt-1 text-sm text-muted-foreground">O rebanho nao possui alertas ativos.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((bubalino) => (
                    <div key={bubalino.id} className="rounded-xl border border-border bg-background/40 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{bubalino.nome}</h3>
                            <StatusBadge status={bubalino.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">{getAlertTitle(bubalino.status)}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>Etiqueta: {bubalino.numero_etiqueta}</span>
                            <span className="flex items-center gap-1">
                              <Thermometer className="h-3.5 w-3.5 text-[#FFB703]" />
                              {bubalino.temperatura ? `${bubalino.temperatura} C` : 'Sem leitura'}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={() => setAlertToResolve(bubalino)}
                          disabled={resolveAlertMutation.isPending}
                          className="bg-primary hover:bg-[#06D001]"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Resolver alerta
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!alertToResolve}
        onOpenChange={() => setAlertToResolve(null)}
        title="Resolver alerta"
        description={`Confirmar resolucao do alerta de "${alertToResolve?.nome}"?`}
        confirmLabel={resolveAlertMutation.isPending ? 'Resolvendo...' : 'Resolver'}
        onConfirm={() => alertToResolve && resolveAlertMutation.mutate(alertToResolve)}
      />
    </div>
  );
}
