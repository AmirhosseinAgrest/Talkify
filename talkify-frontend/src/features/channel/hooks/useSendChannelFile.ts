// src/features/channel/hooks/useSendChannelFile.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api';

export function useSendChannelFile() {
  const queryClient = useQueryClient();
  const addMessage = useChannelStore((state) => state.addMessage);

  return useMutation({
    mutationFn: ({ channelId, formData }: { channelId: string; formData: FormData }) =>
      channelService.sendMessageWithFile(channelId, formData),
    onSuccess: (response) => {
      addMessage(response.data);
      queryClient.invalidateQueries({ queryKey: ['channels', 'my'] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error sending file'));
    },
  });
}
