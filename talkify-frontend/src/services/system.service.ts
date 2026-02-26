// src/services/system.service.ts

import { api } from '@/lib/api';
import type { ApiResponse, Message, Chat, User } from '@/types';

export interface Broadcast {
  id: string;
  content: string;
  adminId: string;
  sentTo: number;
  failed: number;
  createdAt: string;
}

export interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
}

export const systemService = {
  sendBroadcast: async (content: string): Promise<ApiResponse<BroadcastResult>> => {
    const response = await api.post('/system/broadcast', { content });
    return response.data;
  },

  getBroadcastHistory: async (): Promise<ApiResponse<Broadcast[]>> => {
    const response = await api.get('/system/broadcast/history');
    return response.data;
  },

  sendMessage: async (userId: string, content: string): Promise<ApiResponse<{ chat: Chat; message: Message }>> => {
    const response = await api.post('/system/message', { userId, content });
    return response.data;
  },

  getSystemAccount: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/system/account');
    return response.data;
  },
};