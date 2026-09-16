// src/features/chat/hooks/useCreateChat.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { chatService } from '@/services/chat.service';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';

export function useCreateChat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (participantId: string) => chatService.createChat(participantId),
    onSuccess: (response) => {
      const chat = response.data;

      queryClient.invalidateQueries({ queryKey: ['chats'] });

      setActiveChat(chat);
      const otherUser = chat.participants?.find((p) => p.id !== currentUser?.id);
      if (otherUser?.username) {
        navigate(`/${otherUser.username}`);
      } else {
        navigate('/');
      }

      toast.success('New chat created');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error creating chat'));
    },
  });
}
