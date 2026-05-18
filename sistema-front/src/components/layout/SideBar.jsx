import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, LayoutDashboard, Bug, Radio, MapPin, User, LogOut, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Bubalinos', icon: Bug, path: '/bubalinos' },
  { label: 'Coleiras', icon: Radio, path: '/coleiras' },
  { label: 'Localização', icon: MapPin, path: '/localizacao' },
  { label: 'Perfil', icon: User, path: '/perfil' },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
  const location = useLocation();

const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" 
          onClick={onClose} 
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full z-50 bg-background border-r border-border flex flex-col transition-all duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        collapsed ? "lg:w-20" : "lg:w-64",
        "w-72"
      )}>
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">B</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg tracking-tight">BUBATAG</h1>
                <p className="text-xs text-muted-foreground">Rastreamento Inteligente</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive && "text-primary"
                )} />
                {!collapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#06D001]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex justify-center p-2 border-t border-border">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}