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
  const { username } = useParams();
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);

  const isActive = username === channel.username;

  const handleClick = () => {
    if (isActive) return;
    
    setActiveChannel(channel);
    navigate(`/${channel.username}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isActive}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        isActive 
          ? 'bg-primary/10 text-primary cursor-default opacity-70' 
          : 'hover:bg-muted cursor-pointer'
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
          <p className={cn(
            "font-medium truncate",
            isActive && "text-primary"
          )}>
            {channel.name}
          </p>
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

      {channel.unreadCount && channel.unreadCount > 0 && !isActive && (
        <span className="flex items-center justify-center h-5 min-w-5 px-1 bg-primary text-primary-foreground text-xs rounded-full">
          {channel.unreadCount}
        </span>
      )}
    </button>
  );
}