// src/features/channel/hooks/useCreateChannel.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { channelService } from '@/services/channel.service';
import { useChannelStore } from '@/store/useChannelStore';
import { toast } from 'sonner';
import type { CreateChannelForm } from '@/types';
import { getApiErrorMessage } from '@/lib/api';

export function useCreateChannel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  return useMutation({
    mutationFn: (data: CreateChannelForm) => channelService.createChannel(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      setActiveChannel(response.data);
      navigate(`/${response.data.username}`);
      toast.success('Channel created! 📢');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Error creating channel'));
    },
  });
}
