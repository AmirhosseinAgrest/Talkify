// src/features/auth/hooks/useRegister.ts

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { RegisterForm } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export function useRegister() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (data: RegisterForm) =>
      authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      }),

    onSuccess: (response) => {
      login(response.data.user, response.data.token);
      toast.success('Signup successful! 🎉');
      navigate('/');
    },

    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Signup error'));
    },
  });
}
