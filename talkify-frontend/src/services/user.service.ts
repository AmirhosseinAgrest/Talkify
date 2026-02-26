// src/services/user.service.ts

import { api } from '@/lib/api';
import type { User, ApiResponse } from '@/types';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
}

export const userService = {
  updateProfile: async (data: {
    username?: string;
    bio?: string;
    phone?: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  updateAvatar: async (file: File): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<ApiResponse<User>> => {
    const response = await api.delete('/users/profile/avatar');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  },

  getSettings: async (): Promise<ApiResponse<UserSettings>> => {
    const response = await api.get('/users/settings');
    return response.data;
  },

  updateSettings: async (settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> => {
    const response = await api.put('/users/settings', settings);
    return response.data;
  },

  deleteAccount: async (password: string): Promise<ApiResponse<null>> => {
    const response = await api.delete('/users/account', { data: { password } });
    return response.data;
  },
};