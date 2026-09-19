// src/features/auth/hooks/useAuth.ts

import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '@/lib/socket';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
    }
    disconnectSocket();
    logoutStore();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return {
    user,
    isAuthenticated,
    logout,
  };
}