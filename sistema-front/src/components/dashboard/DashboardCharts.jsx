import { STATUS } from '@/lib/rebanho';

const ordemStatus = ['saudavel', 'estressado', 'sem_classificacao', 'sem_conexao'];

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy + radius * Math.sin(radians) };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

function dadosPorStatus(bubalinos) {
  return ordemStatus
    .map((status) => ({
      status,
      ...STATUS[status],
      count: bubalinos.filter((b) => b.status === status).length,
    }))
    .filter((item) => item.count > 0);
}

function Painel({ titulo, descricao, children, className = '' }) {
  return (
    <section className={`surface p-5 md:p-6 ${className}`}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>
      {children}
    </section>
  );
}

function DonutChart({ data, total }) {
  const fatias = data.reduce((lista, item) => {
    const inicio = lista.length ? lista[lista.length - 1].fim : 0;
    const angulo = total ? (item.count / total) * 360 : 0;
    return [...lista, { ...item, inicio, fim: inicio + angulo }];
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        className="relative h-48 w-48 shrink-0"
        role="img"
        aria-label={`Distribuição do rebanho: ${data.map((d) => `${d.count} ${d.label}`).join(', ') || 'sem dados'}`}
      >
        <svg viewBox="0 0 220 220" className="h-full w-full">
          <circle cx="110" cy="110" r="78" fill="none" stroke="hsl(var(--muted))" strokeWidth="22" />

          {fatias.map((item) => {
            const { inicio, fim } = item;

            // Um único grupo ocupa o círculo inteiro: desenha um anel completo.
            if (data.length === 1) {
              return (
                <circle key={item.status} cx="110" cy="110" r="78" fill="none" stroke={item.color} strokeWidth="22" />
              );
            }

            return (
              <path
                key={item.status}
                d={describeArc(110, 110, 78, inicio, Math.max(fim - 3, inicio))}
                fill="none"
                stroke={item.color}
                strokeWidth="22"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-semibold">{total}</span>
          <span className="text-xs text-muted-foreground">{total === 1 ? 'animal' : 'animais'}</span>
        </div>
      </div>

      <ul className="grid w-full gap-2.5">
        {data.length === 0 ? (
          <li className="text-sm text-muted-foreground">Nenhum animal para exibir.</li>
        ) : (
          data.map((item) => (
            <li
              key={item.status}
              className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2.5"
            >
              <span className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">{item.label}</span>
              </span>
              <span className="font-display text-base font-semibold">{item.count}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Medidor({ rotulo, valor, largura, cor, unidade }) {
  return (
    <div className="grid grid-cols-[88px_1fr_64px] items-center gap-3">
      <span className="text-xs text-muted-foreground">{rotulo}</span>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full" style={{ width: `${largura}%`, backgroundColor: cor }} />
      </div>
      <span className="text-right text-xs font-bold">{valor == null ? '—' : `${valor} ${unidade}`}</span>
    </div>
  );
}

function StressRanking({ bubalinos }) {
  const data = bubalinos
    .filter((b) => b.status === 'estressado')
    .sort(
      (a, b) =>
        (b.batimentos ?? 0) + (b.temperatura ?? 0) - ((a.batimentos ?? 0) + (a.temperatura ?? 0))
    );

  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
        <div className="text-sm font-bold">Nenhum animal estressado</div>
        <div className="mt-1 max-w-xs text-xs text-muted-foreground">
          Quando uma coleira indicar estresse, os sinais vitais aparecerão aqui.
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.map((animal, indice) => {
        const larguraBpm = animal.batimentos == null ? 0 : Math.min((animal.batimentos / 150) * 100, 100);
        const larguraTemp =
          animal.temperatura == null ? 0 : Math.min(Math.max(((animal.temperatura - 35) / 8) * 100, 0), 100);

        return (
          <li key={animal.id} className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-danger/15 font-display text-sm font-semibold text-danger">
                {indice + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">{animal.nome}</div>
                <div className="text-xs text-muted-foreground">
                  {animal.nome !== animal.numero_etiqueta ? `Etiqueta ${animal.numero_etiqueta} · ` : ''}
                  {animal.estado_estresse}
                </div>
              </div>
            </div>

            <div className="grid gap-2.5">
              <Medidor rotulo="Batimentos" valor={animal.batimentos} largura={larguraBpm} cor="#FF4D5A" unidade="bpm" />
              <Medidor rotulo="Temperatura" valor={animal.temperatura} largura={larguraTemp} cor="#FFB703" unidade="°C" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function BatteryBars({ coleiras }) {
  const data = coleiras.filter(
    (c) => c.bateria !== null && c.bateria !== undefined && c.bateria !== '' && Number.isFinite(Number(c.bateria))
  );

  if (data.length === 0) {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-6 text-center">
        <p className="text-sm font-bold">Dados de bateria indisponíveis</p>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground">
          A API ainda não registra o nível de carga das coleiras. O indicador aparecerá
          assim que a medição for integrada.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {data.map((coleira) => {
        const bateria = Math.min(100, Math.max(0, Number(coleira.bateria)));
        const cor = bateria > 50 ? '#05D900' : bateria > 20 ? '#FFB703' : '#FF4D5A';

        return (
          <li key={coleira.id} className="grid grid-cols-[100px_1fr_44px] items-center gap-3">
            <span className="truncate font-mono text-xs text-muted-foreground">{coleira.numero_etiqueta}</span>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${bateria}%`, backgroundColor: cor }} />
            </div>
            <span className="text-right text-xs font-bold">{bateria}%</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function DashboardCharts({ bubalinos = [], coleiras = [] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Painel titulo="Status do rebanho" descricao="Distribuição atual dos bubalinos monitorados">
        <DonutChart data={dadosPorStatus(bubalinos)} total={bubalinos.length} />
      </Painel>

      <Painel titulo="Sinais vitais em alerta" descricao="Animais classificados como estressados pelas coleiras">
        <StressRanking bubalinos={bubalinos} />
      </Painel>

      <Painel
        className="lg:col-span-2"
        titulo="Bateria das coleiras"
        descricao="Nível de carga dos dispositivos em campo"
      >
        <BatteryBars coleiras={coleiras} />
      </Painel>
    </div>
  );
}