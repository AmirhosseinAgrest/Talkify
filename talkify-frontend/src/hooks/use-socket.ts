// src/hooks/use-socket.ts

import { useEffect, useCallback } from 'react';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import type { Message } from '@/types';

export function useSocket() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const socket = getSocket();

    socket.on('message:receive', (message: Message) => {
      addMessage(message);
    });

    socket.on('message:status', ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    });

    socket.on('user:online', (userId: string) => {
      console.log('User online:', userId);
    });

    socket.on('user:offline', (userId: string) => {
      console.log('User offline:', userId);
    });

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, addMessage, updateMessageStatus]);

  const sendMessage = useCallback((chatId: string, content: string) => {
    const socket = getSocket();
    socket.emit('message:send', { chatId, content });
  }, []);

  const sendTyping = useCallback((chatId: string) => {
    const socket = getSocket();
    socket.emit('typing:start', { chatId });
  }, []);

  const stopTyping = useCallback((chatId: string) => {
    const socket = getSocket();
    socket.emit('typing:stop', { chatId });
  }, []);

  return { sendMessage, sendTyping, stopTyping };
}