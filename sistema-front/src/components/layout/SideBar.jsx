import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LogOut,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import Logo from '@/components/brand/Logo';
import { menuItems } from './menu';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const { logout } = useAuth();
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menu principal"
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border bg-[hsl(var(--sidebar))] transition-all duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo size={36} showText={!collapsed} />
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all',
                  collapsed && 'lg:justify-center',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                      aria-hidden="true"
                    />
                  )}
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn(collapsed && 'lg:hidden')}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-border p-3">
          <button
            onClick={onToggleCollapse}
            className="hidden w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {collapsed ? (
              <PanelLeftOpen className="mx-auto h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" />
                Recolher menu
              </>
            )}
          </button>

          <button
            onClick={() => setConfirmarSaida(true)}
            title={collapsed ? 'Sair' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger',
              collapsed && 'lg:justify-center'
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className={cn(collapsed && 'lg:hidden')}>Sair</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmarSaida}
        onOpenChange={setConfirmarSaida}
        title="Sair do Bubatag?"
        description="Você precisará entrar novamente para acompanhar o rebanho."
        confirmLabel="Sair"
        destructive
        onConfirm={logout}
      />
    </>
  );
}