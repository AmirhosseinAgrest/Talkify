// src/components/layout/AdminLayout.tsx

import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="container flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/chat">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold">Talkify Admin Panel</h1>
        </div>
      </header>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
}