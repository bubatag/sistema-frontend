import { cn } from '@/lib/utils';

// Logo oficial (public/bubatag.svg) + logotipo em fonte principal.
export default function Logo({ size = 40, showText = true, subtitle, className }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/bubatag.svg"
        alt={showText ? '' : 'Bubatag'}
        style={{ height: size, width: size }}
        className="shrink-0 drop-shadow-[0_4px_14px_rgba(5,217,0,0.35)]"
      />

      {showText && (
        <div className="leading-none">
          <div className="font-display text-xl font-bold tracking-wide text-primary">BUBATAG</div>
          {subtitle && (
            <div className="mt-1 text-[11px] font-medium text-muted-foreground">{subtitle}</div>
          )}
        </div>
      )}
    </div>
  );
}