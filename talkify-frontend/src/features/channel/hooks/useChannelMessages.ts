// src/features/channel/hooks/useChannelMessages.ts

import { useQuery } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { useEffect } from 'react';

export function useChannelMessages(channelId: string | undefined) {
  const setMessages = useChannelStore((state) => state.setMessages);

  const query = useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: () => channelService.getMessages(channelId!),
    enabled: !!channelId,
  });

  useEffect(() => {
    if (query.data?.data) {
      setMessages(query.data.data);
    }
  }, [query.data, setMessages]);

  return query;
}