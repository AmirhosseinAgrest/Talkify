// src/features/channel/hooks/useCreateChannel.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';
import type { CreateChannelForm } from '@/types';

export function useCreateChannel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  return useMutation({
    mutationFn: (data: CreateChannelForm) => channelService.createChannel(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setActiveChannel(response.data);
      navigate(`/channel/${response.data.id}`);
      toast.success('Channel created! 📢');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error creating channel');
    },
  });
}