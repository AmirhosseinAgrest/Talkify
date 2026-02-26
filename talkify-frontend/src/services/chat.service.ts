// src/services/chat.service.ts

import { api } from '@/lib/api';
import type { Chat, Message, ApiResponse } from '@/types';

export const chatService = {
  getChats: async (): Promise<ApiResponse<Chat[]>> => {
    const response = await api.get('/chats');
    return response.data;
  },

  getMessages: async (chatId: string): Promise<ApiResponse<Message[]>> => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, content: string): Promise<ApiResponse<Message>> => {
    const response = await api.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  },

  findOrCreateChat: async (username: string): Promise<ApiResponse<Chat>> => {
    const response = await api.post('/chats/find-or-create', { username });
    return response.data;
  },

  findOrCreateChatWithUser: async (userId: string): Promise<ApiResponse<Chat>> => {
    const response = await api.post('/chats/find-or-create', { userId });
    return response.data;
  },

  sendMessageWithFile: async (
    chatId: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Message>> => {
    const response = await api.post(`/chats/${chatId}/messages/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  editMessage: async (messageId: string, content: string): Promise<ApiResponse<Message>> => {
    const response = await api.put(`/chats/messages/${messageId}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse<Message>> => {
    const response = await api.delete(`/chats/messages/${messageId}`);
    return response.data;
  },

  addReaction: async (messageId: string, emoji: string): Promise<ApiResponse<any>> => {
    const response = await api.post(`/chats/messages/${messageId}/reactions`, { emoji });
    return response.data;
  },

  removeReaction: async (messageId: string, emoji: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/chats/messages/${messageId}/reactions`, {
      data: { emoji },
    });
    return response.data;
  },

  createChat: async (participantId: string): Promise<ApiResponse<Chat>> => {
    const response = await api.post('/chats', { participantId });
    return response.data;
  },
};