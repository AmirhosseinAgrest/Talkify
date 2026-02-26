// src/features/chat/hooks/useMessages.ts

import { useQuery } from '@tanstack/react-query';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/store/useChatStore';
import { useEffect } from 'react';

export function useMessages(chatId: string | undefined) {
  const setMessages = useChatStore((state) => state.setMessages);

  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatService.getMessages(chatId!),
    enabled: !!chatId,
  });

  useEffect(() => {
    if (query.data?.data) {
      setMessages(query.data.data);
    }
  }, [query.data, setMessages]);

  return query;
}