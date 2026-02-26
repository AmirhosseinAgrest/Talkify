// src/features/channel/hooks/useJoinChannel.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';

export function useJoinChannel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  return useMutation({
    mutationFn: (channelId: string) => channelService.joinChannel(channelId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setActiveChannel(response.data);
      navigate(`/channel/${response.data.id}`);
      toast.success('You joined the channel! 🎉');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error joining the channel');
    },
  });
}