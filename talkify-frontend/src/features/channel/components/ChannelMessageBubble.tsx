// src/features/channel/components/ChannelMessageBubble.tsx

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Message, User } from '@/types';
import { api } from '@/lib/api';

interface ChannelMessageBubbleProps {
  message: Message;
}

export function ChannelMessageBubble({ message }: ChannelMessageBubbleProps) {
  const [sender, setSender] = useState<User | null>(null);

  useEffect(() => {
    const fetchSender = async () => {
      try {
        const response = await api.get(`/users/${message.senderId}`);
        setSender(response.data.data);
      } catch (error) {
        console.error('Error fetching sender:', error);
      }
    };

    fetchSender();
  }, [message.senderId]);

  return (
    <div className="flex gap-3">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={sender?.avatar || undefined} />
        <AvatarFallback>
          {sender?.username?.charAt(0).toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {sender?.username || 'Unknown'}
          </span>
          {sender?.isVerified && <VerifiedBadge />}
          <span className="text-xs text-muted-foreground">
            {formatTime(new Date(message.createdAt))}
          </span>
        </div>

        <div className="bg-muted rounded-lg rounded-tl-none px-4 py-2">
          <p className="break-words whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}