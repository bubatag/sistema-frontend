import { cn } from '@/lib/utils';

const tons = {
  primary: { icone: 'text-primary bg-primary/15', barra: 'bg-primary' },
  olive: { icone: 'text-[#90A955] bg-[#90A955]/15', barra: 'bg-[#90A955]' },
  warning: { icone: 'text-warning bg-warning/15', barra: 'bg-warning' },
  danger: { icone: 'text-danger bg-danger/15', barra: 'bg-danger' },
  neutral: { icone: 'text-muted-foreground bg-muted', barra: 'bg-muted-foreground' },
};

export default function KpiCard({ title, value, hint, icon: Icon, tone = 'primary', onClick }) {
  const Component = onClick ? 'button' : 'div';
  const t = tons[tone] || tons.primary;

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'surface group relative flex w-full items-center gap-4 overflow-hidden p-5 text-left',
        onClick && 'transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow'
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', t.barra)} aria-hidden="true" />

      {Icon && (
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', t.icone)}>
          <Icon className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="font-display text-3xl font-semibold leading-tight">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </Component>
  );
}