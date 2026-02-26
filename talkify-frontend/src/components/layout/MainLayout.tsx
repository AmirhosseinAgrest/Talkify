// src/components/layout/MainLayout.tsx

import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const isMobile = useIsMobile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <aside
        className={cn(
          'h-full bg-card border-r transition-all duration-300',
          isMobile ? 'fixed inset-y-0 left-0 z-50 w-80' : 'relative w-80',
          isMobile && !isSidebarOpen && '-translate-x-full'
        )}
      >
        <Sidebar />
      </aside>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => useUIStore.getState().setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}