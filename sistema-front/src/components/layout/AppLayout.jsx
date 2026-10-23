import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './SideBar';
import TopBar from './TopBar';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const usuarioSalvo = localStorage.getItem('usuario');

      if (!usuarioSalvo) {
        setUserName('');
        return;
      }

      const usuario = JSON.parse(usuarioSalvo);

      setUserName(
        usuario.nome ||
        usuario.full_name ||
        usuario.email ||
        ''
      );
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUserName('');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
        />

        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
