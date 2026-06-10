import React from 'react';

export default function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  accentColor = 'text-primary',
  bgAccent = 'bg-primary/10',
  onClick,
}) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-4 flex flex-col gap-3 text-left ${
        onClick ? 'transition-colors hover:border-primary/40 hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/30' : ''
      }`}
    >
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
    </Component>
  );
}
