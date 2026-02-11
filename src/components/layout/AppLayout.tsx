import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './menu/Sidebar';
import { Header } from './menu/Header';
import { BottomNav } from './menu/BottomNav';
import { MobileMenuGrid } from './menu/MobileMenuGrid';
import { cn } from '../../lib/utils/utils';
import { FabButton } from "./menu/FabButton";
import { MENU_ITEMS } from './menu/menu';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar: desktop */}
      <Sidebar
        className="hidden lg:flex"
        navigation={MENU_ITEMS.map((item) => ({
          ...item,
          active:
            location.pathname === item.href ||
            location.pathname.startsWith(item.href + '/'),
        }))}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      {/* Header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Conteúdo */}
      <main
        className={cn(
          'pt-16 transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64',
          'pb-24 lg:pb-0'
        )}
      >
        <Outlet />
      </main>

      {/* BottomNav mobile */}
      <BottomNav onOpenMore={() => setMobileMenuOpen(true)} />

      {/* MobileMenuGrid */}
      <MobileMenuGrid
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={MENU_ITEMS}
      />

      <FabButton />
    </div>
  );
};

export default AppLayout;
