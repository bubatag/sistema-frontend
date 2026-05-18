import React from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >

        <header className="h-20 border-b border-border bg-background flex items-center px-8">
          <div className="w-full max-w-md">
            <input
              placeholder="Buscar bubalinos, coleiras..."
              className="w-full bg-card border border-border rounded-xl px-4 py-3 outline-none"
            />
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}