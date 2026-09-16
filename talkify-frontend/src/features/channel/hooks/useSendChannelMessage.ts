// src/features/channel/hooks/useSendChannelMessage.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';

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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error sending message'));
    },
  });
}
