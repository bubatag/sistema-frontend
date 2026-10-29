import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Beef,
  Radio,
  HeartPulse,
  AlertTriangle,
  MapPin,
  LayoutDashboard,
  CheckCircle2,
  Thermometer,
  ChevronRight,
} from 'lucide-react';

import { useColeiras } from '@/hooks/useColeiras';
import { useUsuario } from '@/hooks/useUsuario';
import { mensagemDeErro } from '@/lib/rebanho';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import KpiCard from '@/components/shared/KpiCard';
import StatusBadge from '@/components/shared/StatusBadge';
import ErrorState from '@/components/shared/ErrorState';

const atalhos = [
  {
    titulo: 'Dashboard',
    descricao: 'Indicadores e sinais vitais do rebanho',
    caminho: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    titulo: 'Bubalinos',
    descricao: 'Consulte cada animal e seu estado de saúde',
    caminho: '/bubalinos',
    icon: Beef,
  },
  {
    titulo: 'Coleiras',
    descricao: 'Cadastre e acompanhe as coleiras IoT',
    caminho: '/coleiras',
    icon: Radio,
  },
  {
    titulo: 'Localização',
    descricao: 'Veja onde cada animal está no pasto',
    caminho: '/localizacao',
    icon: MapPin,
  },
];

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomePage() {
  const [alertasAbertos, setAlertasAbertos] = useState(false);
  const { usuario } = useUsuario();
  const { coleiras, bubalinos, isLoading, isError, error, refetch } = useColeiras({
    atualizarAutomaticamente: true,
  });

  const primeiroNome = (usuario?.nome || '').split(' ')[0];
  const saudaveis = bubalinos.filter((b) => b.status === 'saudavel').length;
  const alertas = bubalinos.filter((b) => b.status === 'estressado');

  return (
    <div className="space-y-8">
      <section className="surface relative overflow-hidden p-6 md:p-10">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #05D900 0%, transparent 65%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-2xl">
          <p className="text-sm font-bold text-primary">{saudacao()}{primeiroNome ? `, ${primeiroNome}` : ''}</p>
          <h1 className="mt-2 text-4xl font-semibold md:text-5xl">Seu rebanho em tempo real</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {alertas.length > 0
              ? `${alertas.length} ${alertas.length === 1 ? 'animal precisa' : 'animais precisam'} da sua atenção agora.`
              : 'Tudo certo por aqui: nenhum animal em alerta no momento.'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/localizacao">
                <MapPin className="h-5 w-5" />
                Abrir mapa
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/dashboard">Ver dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {isError && (
        <ErrorState
          title="Não foi possível carregar os dados do rebanho"
          message={mensagemDeErro(error, 'Verifique se a API está funcionando e tente novamente.')}
          onRetry={() => refetch()}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Bubalinos" value={bubalinos.length} icon={Beef} tone="olive" />
          <KpiCard title="Coleiras" value={coleiras.length} icon={Radio} tone="primary" />
          <KpiCard title="Saudáveis" value={saudaveis} icon={HeartPulse} tone="primary" />
          <KpiCard
            title="Alertas ativos"
            value={alertas.length}
            hint={alertas.length ? 'Toque para ver os detalhes' : 'Nenhum alerta'}
            icon={AlertTriangle}
            tone={alertas.length ? 'danger' : 'neutral'}
            onClick={() => setAlertasAbertos(true)}
          />
        </div>
      )}

      <section aria-labelledby="atalhos">
        <h2 id="atalhos" className="mb-4 text-xl font-semibold">Acesso rápido</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {atalhos.map(({ titulo, descricao, caminho, icon: Icon }) => (
            <Link
              key={caminho}
              to={caminho}
              className="surface group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold">{titulo}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{descricao}</span>
              </span>

              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>

      <Dialog open={alertasAbertos} onOpenChange={setAlertasAbertos}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alertas ativos</DialogTitle>
            <DialogDescription>
              {alertas.length
                ? `${alertas.length} ocorrência(s) identificada(s) pelas coleiras.`
                : 'Nenhum alerta ativo no momento.'}
            </DialogDescription>
          </DialogHeader>

          {alertas.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-border bg-background/40 p-8 text-center">
              <CheckCircle2 className="mb-3 h-10 w-10 text-primary" />
              <h3 className="font-display text-lg font-semibold">Tudo em ordem</h3>
              <p className="mt-1 text-sm text-muted-foreground">O rebanho não possui alertas ativos.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alertas.map((animal) => (
                <li key={animal.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold">{animal.nome}</h3>
                        <StatusBadge status={animal.status} />
                      </div>

                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Etiqueta {animal.numero_etiqueta} · {animal.estado_estresse}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Thermometer className="h-3.5 w-3.5 text-warning" />
                        {animal.temperatura != null ? `${animal.temperatura} °C` : 'Sem leitura de temperatura'}
                      </p>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                      <Link to="/localizacao" onClick={() => setAlertasAbertos(false)}>
                        Ver no mapa
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}