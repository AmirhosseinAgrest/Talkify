// src/features/chat/hooks/useChatScroll.ts

import { useEffect, useRef } from 'react';
import type { Message } from '@/types';

export function useChatScroll(messages: Message[]) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return scrollRef;
}