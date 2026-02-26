// src/services/channel.service.ts

import { api } from '@/lib/api';
import type { Channel, Message, ApiResponse } from '@/types';

export const channelService = {
  getMyChannels: async (): Promise<ApiResponse<Channel[]>> => {
    const response = await api.get('/channels/my');
    return response.data;
  },

  searchChannels: async (query: string): Promise<ApiResponse<Channel[]>> => {
    const response = await api.get('/channels/search', { params: { q: query } });
    return response.data;
  },

  createChannel: async (data: {
    name: string;
    username: string;
    description?: string;
  }): Promise<ApiResponse<Channel>> => {
    const response = await api.post('/channels', data);
    return response.data;
  },

  getChannel: async (channelId: string): Promise<ApiResponse<Channel>> => {
    const response = await api.get(`/channels/${channelId}`);
    return response.data;
  },

  joinChannel: async (channelId: string): Promise<ApiResponse<Channel>> => {
    const response = await api.post(`/channels/${channelId}/join`);
    return response.data;
  },

  leaveChannel: async (channelId: string): Promise<ApiResponse<Channel>> => {
    const response = await api.post(`/channels/${channelId}/leave`);
    return response.data;
  },

  getMessages: async (channelId: string): Promise<ApiResponse<Message[]>> => {
    const response = await api.get(`/channels/${channelId}/messages`);
    return response.data;
  },

  sendMessage: async (channelId: string, content: string): Promise<ApiResponse<Message>> => {
    const response = await api.post(`/channels/${channelId}/messages`, { content });
    return response.data;
  },
};