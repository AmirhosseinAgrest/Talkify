// src/services/report.service.ts

import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface Report {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedId: string;
  reportedUsername: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: string;
  reviewedAt?: string;
  resolution?: string;
  createdAt: string;
}

export const REPORT_REASONS = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Harassment' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'fake_account', label: 'Fake account' },
  { id: 'violence', label: 'Violence' },
  { id: 'other', label: 'Other' },
];

export const reportService = {
  create: async (reportedId: string, reason: string, description?: string): Promise<ApiResponse<Report>> => {
    const response = await api.post('/reports', { reportedId, reason, description });
    return response.data;
  },

  getAll: async (status?: string): Promise<ApiResponse<Report[]>> => {
    const response = await api.get('/reports', { params: { status } });
    return response.data;
  },

  review: async (reportId: string, resolution: string, action?: string): Promise<ApiResponse<Report>> => {
    const response = await api.put(`/reports/${reportId}/review`, { resolution, action });
    return response.data;
  },

  dismiss: async (reportId: string): Promise<ApiResponse<Report>> => {
    const response = await api.put(`/reports/${reportId}/dismiss`);
    return response.data;
  },
};