import React from 'react';

export default function DashboardCharts({ bubalinos }) {
  const total = bubalinos.length;
  const saudaveis = bubalinos.filter((b) => b.status === 'saudavel').length;
  const alertas = total - saudaveis;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-sm text-muted-foreground">Resumo rapido</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-xl font-semibold">{total}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Saudaveis</div>
          <div className="text-xl font-semibold">{saudaveis}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-muted-foreground">Alertas</div>
          <div className="text-xl font-semibold">{alertas}</div>
        </div>
      </div>
    </div>
  );
}
