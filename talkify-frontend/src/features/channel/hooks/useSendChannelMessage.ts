// src/features/channel/hooks/useSendChannelMessage.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';

export function useSendChannelMessage() {
  const queryClient = useQueryClient();
  const addMessage = useChannelStore((state) => state.addMessage);

  return useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) =>
      channelService.sendMessage(channelId, content),
    onSuccess: (response) => {
      addMessage(response.data);
      queryClient.invalidateQueries({ queryKey: ['channels', 'my'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error sending message');
    },
  });
}