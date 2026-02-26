// src/components/layout/AuthLayout.tsx

import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Talkify</h1>
          <p className="text-muted-foreground mt-2">Stay connected with your friends</p>
        </div>
        
        <div className="bg-card rounded-2xl shadow-xl p-6 border">
          <Outlet />
        </div>
      </div>
    </div>
  );
}