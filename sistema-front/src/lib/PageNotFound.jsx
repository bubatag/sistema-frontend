import React from 'react';
import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold">Pagina nao encontrada</h1>
      <p className="text-muted-foreground">A rota que voce tentou acessar nao existe.</p>
      <Link className="text-primary underline" to="/">Voltar para o inicio</Link>
    </div>
  );
}
