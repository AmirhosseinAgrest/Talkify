// src/features/channel/hooks/useLeaveChannel.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';

export function useLeaveChannel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  return useMutation({
    mutationFn: (channelId: string) => channelService.leaveChannel(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setActiveChannel(null);
      navigate('/chat');
      toast.success('You have left the channel');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error leaving the channel');
    },
  });
}