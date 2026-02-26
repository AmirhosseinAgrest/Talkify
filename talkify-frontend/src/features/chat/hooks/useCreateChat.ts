// src/features/chat/hooks/useCreateChat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/store/useChatStore';
import { toast } from 'sonner';

export function useCreateChat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  return useMutation({
    mutationFn: (participantId: string) => chatService.createChat(participantId),
    onSuccess: (response) => {
      const chat = response.data;

      queryClient.invalidateQueries({ queryKey: ['chats'] });

      setActiveChat(chat);

      navigate(`/chat/${chat.id}`);

      toast.success('New chat created');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error creating chat');
    },
  });
}