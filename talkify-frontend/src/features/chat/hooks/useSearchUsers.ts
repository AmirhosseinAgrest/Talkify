// src/features/chat/hooks/useSearchUsers.ts

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User, ApiResponse } from '@/types';

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async (): Promise<User[]> => {
      const response = await api.get<ApiResponse<User[]>>('/users/search', {
        params: { q: query },
      });
      return response.data.data;
    },
    enabled: query.length >= 1, 
    staleTime: 30000, 
  });
}