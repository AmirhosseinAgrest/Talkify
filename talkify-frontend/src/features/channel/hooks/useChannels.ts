// src/features/channel/hooks/useChannels.ts

import { useQuery } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { useEffect } from 'react';

export function useChannels() {
  const setChannels = useChannelStore((state) => state.setChannels);

  const query = useQuery({
    queryKey: ['channels'],
    queryFn: () => channelService.getMyChannels(),
  });

  useEffect(() => {
    if (query.data?.data) {
      setChannels(query.data.data);
    }
  }, [query.data, setChannels]);

  return query;
}