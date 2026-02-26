// src/features/auth/hooks/useLogin.ts

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { LoginForm } from '@/types';

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginForm) => authService.login(data),
    onSuccess: (response) => {
      console.log('✅ Login API response:', response);

      const { user, token } = response.data;

      if (!token) {
        toast.error('Error: Token not received');
        return;
      }

      login(user, token);

      toast.success('Welcome! 👋');

      setTimeout(() => {
        navigate('/chat');
      }, 100);
    },
    onError: (error: any) => {
      console.error('❌ Login error:', error);
      toast.error(error.response?.data?.message || 'Login error');
    },
  });
}