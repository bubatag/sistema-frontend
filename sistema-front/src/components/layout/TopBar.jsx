import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { menuItems } from './menu';

export default function TopBar({ onMenuClick, userName }) {
  const { pathname } = useLocation();
  const paginaAtual = menuItems.find((item) => item.path === pathname)?.label || 'Bubatag';
  const inicial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="font-display text-lg font-medium">{paginaAtual}</span>
      </div>

      <Link
        to="/perfil"
        className="flex items-center gap-2.5 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3 transition-colors hover:border-primary/50"
        aria-label="Abrir meu perfil"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient font-display text-sm font-semibold text-white">
          {inicial}
        </span>
        <span className="hidden max-w-[160px] truncate text-sm font-bold sm:block">
          {userName || 'Usuário'}
        </span>
      </Link>
    </header>
  );
}