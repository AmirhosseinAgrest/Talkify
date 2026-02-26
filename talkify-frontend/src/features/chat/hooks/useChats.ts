// src/features/chat/hooks/useChats.ts

import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/store/useChatStore';
import { useEffect } from 'react';

export function useChats() {
  const setChats = useChatStore((state) => state.setChats);

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
  });

  useEffect(() => {
    if (query.data?.data) {
      setChats(query.data.data);
    }
  }, [query.data, setChats]);

  return query;
}