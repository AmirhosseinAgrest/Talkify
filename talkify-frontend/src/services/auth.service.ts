// src/services/auth.service.ts

import { api } from '@/lib/api';
import type { User, LoginForm, RegisterForm, ApiResponse } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (data: LoginForm): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterForm): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};