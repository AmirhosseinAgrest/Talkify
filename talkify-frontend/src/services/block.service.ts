// src/services/block.service.ts

import { api } from '@/lib/api';
import type { User, ApiResponse } from '@/types';

export interface BlockStatus {
  blockedByMe: boolean;
  blockedMe: boolean;
  isBlocked: boolean;
}

interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export const blockService = {
  block: async (userId: string): Promise<ApiResponse<Block>> => {
    const response = await api.post('/blocks', { userId });
    return response.data;
  },

  unblock: async (userId: string): Promise<ApiResponse<null>> => {
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