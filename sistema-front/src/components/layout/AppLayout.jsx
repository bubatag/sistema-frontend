import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './SideBar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';
import { useUsuario } from '@/hooks/useUsuario';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { usuario } = useUsuario();

  const userName = usuario?.nome || usuario?.full_name || usuario?.email || '';

  return (
    <div className="min-h-screen">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((valor) => !valor)}
      />

      <div className={cn('transition-all duration-300', collapsed ? 'lg:ml-20' : 'lg:ml-64')}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} userName={userName} />

        <main id="conteudo" className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}