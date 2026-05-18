import React from 'react';

export default function UserNotRegisteredError() {
  return (
    <div className="p-6 border border-border rounded-xl bg-card text-center">
      <h2 className="text-lg font-semibold">Usuario nao registrado</h2>
      <p className="text-sm text-muted-foreground mt-2">Finalize seu cadastro para continuar.</p>
    </div>
  );
}
