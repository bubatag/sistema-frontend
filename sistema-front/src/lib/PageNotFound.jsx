import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/brand/Logo';

export default function PageNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <Logo size={64} showText={false} />
      <div>
        <p className="font-display text-6xl font-bold text-gradient">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-1.5 text-muted-foreground">
          O endereço que você tentou acessar não existe ou foi movido.
        </p>
      </div>
      <Button asChild>
        <Link to="/">Voltar para o início</Link>
      </Button>
    </div>
  );
}