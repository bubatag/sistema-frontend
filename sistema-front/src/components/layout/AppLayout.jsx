import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await base44.auth.me();
        setUserName(user.full_name || user.email || '');
      } catch {
        setUserName('');
      }
    }

    loadUser();
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
