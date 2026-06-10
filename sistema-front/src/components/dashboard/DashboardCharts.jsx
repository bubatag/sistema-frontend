import React from 'react';

const statusConfig = {
  saudavel: { label: 'Saudaveis', color: '#06D001' },
  estressado: { label: 'Estressados', color: '#E63946' },
  fora_do_pasto: { label: 'Fora do pasto', color: '#FFB703' },
  sem_conexao: { label: 'Sem conexao', color: '#666666' },
};

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

function statusData(bubalinos) {
  return Object.entries(statusConfig)
    .map(([status, config]) => ({
      status,
      ...config,
      count: bubalinos.filter((b) => b.status === status).length,
    }))
    .filter((item) => item.count > 0);
}

function DonutChart({ data, total }) {
  let currentAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative h-48 w-48 shrink-0">
        <svg viewBox="0 0 220 220" className="h-full w-full">
          <circle cx="110" cy="110" r="78" fill="none" stroke="hsl(var(--muted))" strokeWidth="24" />
          {data.map((item) => {
            const angle = total ? (item.count / total) * 360 : 0;
            const start = currentAngle;
            const end = currentAngle + angle;
            currentAngle = end;

            return (
              <path
                key={item.status}
                d={describeArc(110, 110, 78, start, Math.max(end - 2, start))}
                fill="none"
                stroke={item.color}
                strokeWidth="24"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">animais</span>
        </div>
      </div>

      <div className="grid w-full gap-3">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
            <span className="text-sm font-semibold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStressScore(bubalino) {
  const bpm = Number(bubalino.batimentos || 0);
  const temp = Number(bubalino.temperatura || 0);
  return bpm + Math.max(temp - 38, 0) * 18;
}

function StressRanking({ bubalinos }) {
  const data = bubalinos
    .filter((b) => b.status === 'estressado')
    .map((b) => ({
      ...b,
      stressScore: getStressScore(b),
    }))
    .sort((a, b) => b.stressScore - a.stressScore);

  if (data.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-background/40 text-center">
        <div className="text-sm font-medium">Nenhum animal estressado</div>
        <div className="mt-1 text-xs text-muted-foreground">Os sinais vitais estao dentro do esperado.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.map((bubalino, index) => {
          const bpm = Number(bubalino.batimentos || 0);
          const temp = Number(bubalino.temperatura || 0);
          const bpmWidth = Math.min((bpm / 90) * 100, 100);
          const tempWidth = Math.min(((temp - 37) / 3) * 100, 100);

          return (
            <div key={bubalino.id} className="rounded-xl border border-border bg-background/40 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E63946]/10 text-xs font-bold text-[#E63946]">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{bubalino.nome}</div>
                    <div className="text-xs text-muted-foreground">{bubalino.numero_etiqueta}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-[92px_1fr_56px] items-center gap-2">
                  <span className="text-xs text-muted-foreground">BPM</span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[#E63946]" style={{ width: `${bpmWidth}%` }} />
                  </div>
                  <span className="text-right text-xs font-semibold">{bpm || '--'}</span>
                </div>
                <div className="grid grid-cols-[92px_1fr_56px] items-center gap-2">
                  <span className="text-xs text-muted-foreground">Temperatura</span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[#FFB703]" style={{ width: `${tempWidth}%` }} />
                  </div>
                  <span className="text-right text-xs font-semibold">{temp ? `${temp} C` : '--'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#E63946]" /> Batimentos</span>
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FFB703]" /> Temperatura</span>
      </div>
    </div>
  );
}

function BatteryBars({ coleiras }) {
  const data = coleiras.filter((c) => c.bateria !== '' && c.bateria !== null && c.bateria !== undefined);

  return (
    <div className="grid gap-3">
      {data.map((c) => {
        const bateria = Number(c.bateria);
        const color = bateria > 50 ? '#06D001' : bateria > 20 ? '#FFB703' : '#E63946';

        return (
          <div key={c.id} className="grid grid-cols-[72px_1fr_44px] items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{c.numero_etiqueta}</span>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${bateria}%`, backgroundColor: color }} />
            </div>
            <span className="text-right text-xs font-semibold">{bateria}%</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardCharts({ bubalinos, coleiras = [] }) {
  const total = bubalinos.length;
  const statuses = statusData(bubalinos);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Status do rebanho</h2>
          <p className="text-sm text-muted-foreground">Distribuicao atual dos bubalinos monitorados</p>
        </div>
        <DonutChart data={statuses} total={total} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Sinais vitais</h2>
          <p className="text-sm text-muted-foreground">Ranking dos animais estressados por bpm e temperatura</p>
        </div>
        <StressRanking bubalinos={bubalinos} />
      </section>

      <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
        <div className="mb-4">
          <h2 className="text-base font-semibold">Bateria das coleiras</h2>
          <p className="text-sm text-muted-foreground">Nivel de carga dos dispositivos em campo</p>
        </div>
        <BatteryBars coleiras={coleiras} />
      </section>
    </div>
  );
}
