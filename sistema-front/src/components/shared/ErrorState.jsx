import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorState({ title, message, onRetry }) {
  return (
    <div role="alert" className="surface flex flex-col items-start gap-3 border-danger/40 p-6 sm:flex-row sm:items-center">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {message && <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>}
      </div>

      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}