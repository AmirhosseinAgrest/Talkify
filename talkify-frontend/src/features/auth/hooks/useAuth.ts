// src/features/auth/hooks/useAuth.ts

import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket } from '@/lib/socket';
import { toast } from 'sonner';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout: logoutStore } = useAuthStore();

  const logout = () => {
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