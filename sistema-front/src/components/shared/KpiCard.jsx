import React from 'react';

export default function KpiCard({ title, value, icon: Icon, trend, trendLabel, accentColor = 'text-primary', bgAccent = 'bg-primary/10' }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-lg ${bgAccent} flex items-center justify-center`}>
          {Icon ? <Icon className={`h-5 w-5 ${accentColor}`} /> : null}
        </div>
        {trend != null && (
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold">{trend}%</span> {trendLabel || ''}
          </div>
        )}
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
    </div>
  );
}
