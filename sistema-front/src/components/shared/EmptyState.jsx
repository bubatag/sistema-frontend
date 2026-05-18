import React from 'react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center space-y-3">
      {Icon ? <Icon className="mx-auto h-10 w-10 text-muted-foreground" /> : null}
      <div className="text-lg font-semibold">{title}</div>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel ? (
        <div className="pt-2">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
