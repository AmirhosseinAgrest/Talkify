// src/services/admin.service.ts

import { api } from '@/lib/api';
import type { User, Channel, DashboardStats, ApiResponse } from '@/types';

export const adminService = {
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAllChannels: async (): Promise<ApiResponse<Channel[]>> => {
    const response = await api.get('/admin/channels');
    return response.data;
  },

  verifyUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.post(`/admin/users/${userId}/verify`);
    return response.data;
  },

  unverifyUser: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.delete(`/admin/users/${userId}/verify`);
    return response.data;
  },

  verifyChannel: async (channelId: string): Promise<ApiResponse<Channel>> => {
    const response = await api.post(`/admin/channels/${channelId}/verify`);
    return response.data;
  },

  unverifyChannel: async (channelId: string): Promise<ApiResponse<Channel>> => {
    const response = await api.delete(`/admin/channels/${channelId}/verify`);
    return response.data;
  },
};