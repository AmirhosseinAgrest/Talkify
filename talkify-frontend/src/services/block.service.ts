// src/services/block.service.ts

import { api } from '@/lib/api';
import type { User, ApiResponse } from '@/types';

export interface BlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
  isBlocked: boolean;
}

export const blockService = {
  block: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/blocks', { userId });
    return response.data;
  },

  unblock: async (userId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete('/blocks', { data: { userId } });
    return response.data;
  },

  getBlocked: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/blocks');
    return response.data;
  },

  checkStatus: async (userId: string): Promise<ApiResponse<BlockStatus>> => {
    const response = await api.get(`/blocks/check/${userId}`);
    return response.data;
  },
};