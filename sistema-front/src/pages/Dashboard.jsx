import { Beef, Thermometer, Radio, RefreshCw, AlertTriangle } from 'lucide-react';

import { useColeiras } from '@/hooks/useColeiras';
import { mensagemDeErro } from '@/lib/rebanho';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import KpiCard from '@/components/shared/KpiCard';
import ErrorState from '@/components/shared/ErrorState';
import EmptyState from '@/components/shared/EmptyState';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

export default function Dashboard() {
  const { usuarioId, coleiras, bubalinos, isLoading, isError, error, refetch, isFetching } =
    useColeiras({ atualizarAutomaticamente: true });

  const temperaturas = bubalinos
    .map((b) => Number(b.temperatura))
    .filter((t) => Number.isFinite(t));

  const tempMedia = temperaturas.length
    ? (temperaturas.reduce((soma, t) => soma + t, 0) / temperaturas.length).toFixed(1)
    : null;

  const coleirasAtivas = coleiras.filter((c) => c.ativo !== false).length;
  const emAlerta = bubalinos.filter((b) => b.status === 'estressado').length;

  // Lista no formato esperado pelo gráfico de bateria.
  const coleirasParaGrafico = coleiras.map((c) => ({
    id: c._id || c.n_coleira,
    numero_etiqueta: c.n_coleira || '—',
    bateria: c.bateria ?? null,
  }));

  if (!usuarioId) {
    return (
      <ErrorState
        title="Não foi possível identificar o usuário"
        message="Saia da conta e entre novamente."
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral da saúde e dos equipamentos do seu rebanho."
        actions={
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Atualizando...' : 'Atualizar dados'}
          </Button>
        }
      />

      {isError && (
        <ErrorState
          title="Não foi possível carregar os dados"
          message={mensagemDeErro(error, 'Verifique se a API está funcionando e tente novamente.')}
          onRetry={() => refetch()}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Bubalinos monitorados" value={bubalinos.length} icon={Beef} tone="olive" />
          <KpiCard
            title="Temperatura média"
            value={tempMedia ? `${tempMedia} °C` : '—'}
            hint={tempMedia ? `${temperaturas.length} leitura(s)` : 'Sem leituras'}
            icon={Thermometer}
            tone="warning"
          />
          <KpiCard title="Coleiras ativas" value={coleirasAtivas} icon={Radio} tone="primary" />
          <KpiCard
            title="Animais em alerta"
            value={emAlerta}
            icon={AlertTriangle}
            tone={emAlerta ? 'danger' : 'neutral'}
          />
        </div>
      )}

      {!isLoading && !isError && bubalinos.length === 0 && (
        <EmptyState
          icon={Beef}
          title="Nenhum bubalino monitorado"
          description="Quando houver animais associados às coleiras da sua conta, eles aparecerão aqui."
        />
      )}

      {!isLoading && !isError && (
        <DashboardCharts bubalinos={bubalinos} coleiras={coleirasParaGrafico} />
      )}
    </div>
  );
}