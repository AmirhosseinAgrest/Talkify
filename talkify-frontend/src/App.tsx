// src/App.tsx

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { MainLayout } from '@/components/layout/MainLayout';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ChatPage from '@/pages/chat/ChatPage';
import AdminPage from '@/pages/admin/AdminPage';
import NotFoundPage from '@/pages/error/NotFoundPage';
import { UsernameRouter } from '@/components/common/UsernameRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function SocketManager() {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initSocket = useSocketStore((state) => state.initSocket);
  const disconnect = useSocketStore((state) => state.disconnect);
  const isConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    if (isAuthenticated && token) {
      if (!isConnected) {
        initSocket(token);
      }
    } else {
      if (isConnected) {
        disconnect();
      }
    }
  }, [isAuthenticated, token, isConnected, initSocket, disconnect]);

  return null;
}

function AppContent() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setIsReady(true);
      } else {
        setTimeout(checkHydration, 50);
      }
    };
    checkHydration();
  }, []);

  if (!isReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Talkify</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SocketManager />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<ChatPage />} />
          <Route path="/:username" element={<UsernameRouter />} />
        </Route>

        <Route path="/chat" element={<Navigate to="/" replace />} />
        <Route path="/chat/:username" element={<Navigate to="/:username" replace />} />
        <Route path="/channel/:username" element={<Navigate to="/:username" replace />} />


        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/admin" element={<AdminPage />} />

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
        <Toaster position="top-center" richColors dir="rtl" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;