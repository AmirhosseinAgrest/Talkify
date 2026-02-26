// src/features/auth/hooks/useRegister.ts

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { RegisterForm } from '@/types';

export function useRegister() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: RegisterForm) => authService.register(data),
    onSuccess: (response) => {
      login(response.data.user, response.data.token);
      toast.success('Signup successful! 🎉');
      navigate('/chat');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Signup error');
    },
  });
}