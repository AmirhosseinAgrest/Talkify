// src/services/suspension.service.ts

import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface Suspension {
  id: string;
  userId: string;
  username: string;
  adminId: string;
  adminUsername: string;
  reason: string;
  duration: number | 'permanent';
  expiresAt: string;
  isActive: boolean;
  isPermanent: boolean;
  createdAt: string;
  liftedAt?: string;
  liftedBy?: string;
  liftedByUsername?: string;
}

export const suspensionService = {
  suspend: async (userId: string, duration: number | 'permanent', reason?: string): Promise<ApiResponse<Suspension>> => {
    const response = await api.post('/suspensions', { userId, duration, reason });
    return response.data;
  },

  unsuspend: async (suspensionId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/suspensions/${suspensionId}`);
    return response.data;
  },

  getActive: async (): Promise<ApiResponse<Suspension[]>> => {
    const response = await api.get('/suspensions/active');
    return response.data;
  },

  getAll: async (): Promise<ApiResponse<Suspension[]>> => {
    const response = await api.get('/suspensions/all');
    return response.data;
  },

  checkMySuspension: async (): Promise<ApiResponse<Suspension | null>> => {
    const response = await api.get('/suspensions/check');
    return response.data;
  },
};