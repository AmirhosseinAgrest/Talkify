// src/features/auth/hooks/useLogin.ts

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { LoginRequest } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export function useLogin() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),

    onSuccess: (response) => {

      const { user, token } = response.data;

      if (!token) {
        toast.error('Error: Token not received');
        return;
      }

      login(user, token);

      toast.success('Welcome! 👋');

      setTimeout(() => {
        navigate('/');
      }, 100);
    },

    onError: (error: unknown) => {
      console.error('❌ Login error:', error);
      toast.error(getApiErrorMessage(error, 'Login error'));
    },
  });
}
