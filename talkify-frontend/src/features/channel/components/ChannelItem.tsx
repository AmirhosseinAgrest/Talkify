// src/features/channel/components/ChannelItem.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { useChannelStore } from '@/store/useChannelStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Channel } from '@/types';

interface ChannelItemProps {
  channel: Channel;
}

export function ChannelItem({ channel }: ChannelItemProps) {
  const navigate = useNavigate();
  const { channelId } = useParams();
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  const isActive = channelId === channel.id;

  const handleClick = () => {
    setActiveChannel(channel);
    navigate(`/channel/${channel.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
      )}
    >
      <Avatar>
        <AvatarImage src={channel.avatar || undefined} />
        <AvatarFallback className="bg-primary/10">
          {channel.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-medium truncate">{channel.name}</p>
          {channel.isVerified && <VerifiedBadge/>}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {channel.lastMessage?.content || `@${channel.username}`}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        {channel.lastMessage && (
          <span className="text-xs text-muted-foreground">
            {formatTime(new Date(channel.lastMessage.createdAt))}
          </span>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {channel.memberCount}
        </div>
      </div>
    </button>
  );
}