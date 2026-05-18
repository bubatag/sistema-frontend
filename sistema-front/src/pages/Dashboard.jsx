import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bug, Thermometer, Radio, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import KpiCard from '@/components/shared/KpiCard';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

export default function Dashboard() {
  const { data: bubalinos = [], isLoading } = useQuery({
    queryKey: ['bubalinos'],
    queryFn: () => base44.entities.Bubalino.list(),
  });

  const { data: coleiras = [] } = useQuery({
    queryKey: ['coleiras'],
    queryFn: () => base44.entities.Coleira.list(),
  });

  const tempMedia = bubalinos.length
    ? (bubalinos.reduce((s, b) => s + (b.temperatura || 0), 0) / bubalinos.filter(b => b.temperatura).length).toFixed(1)
    : '—';

  const coleirasAtivas = coleiras.filter(c => c.status === 'ativa').length;
  const alertas = bubalinos.filter(b => b.status && b.status !== 'saudavel').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu rebanho</p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-card" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Bubalinos Cadastrados" value={bubalinos.length} icon={Bug} trend={3} trendLabel="vs mês anterior" />
          <KpiCard title="Temp. Média do Rebanho" value={`${tempMedia}°C`} icon={Thermometer} accentColor="text-[#FFB703]" bgAccent="bg-[#FFB703]/10" />
          <KpiCard title="Coleiras Conectadas" value={coleirasAtivas} icon={Radio} accentColor="text-[#06D001]" bgAccent="bg-[#06D001]/10" />
          <KpiCard title="Alertas Ativos" value={alertas} icon={AlertTriangle} accentColor="text-[#E63946]" bgAccent="bg-[#E63946]/10" />
        </div>
      )}

      {/* Charts */}
      <DashboardCharts bubalinos={bubalinos} />
    </div>
  );
}