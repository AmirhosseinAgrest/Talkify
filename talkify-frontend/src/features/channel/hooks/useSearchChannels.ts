// src/features/channel/hooks/useSearchChannels.ts

import { useQuery } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import type { Channel } from '@/types';

export function useSearchChannels(query: string) {
  return useQuery({
    queryKey: ['channels', 'search', query],
    queryFn: async (): Promise<Channel[]> => {
      const response = await channelService.searchChannels(query);
      return response.data;
    },
    enabled: query.length >= 1,
    staleTime: 30000,
  });
}