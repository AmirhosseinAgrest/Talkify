// src/features/channel/components/SearchChannelDialog.tsx

import { useState } from 'react';
import { Search, Loader2, Users, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { useSearchChannels } from '../hooks/useSearchChannels';
import { useJoinChannel } from '../hooks/useJoinChannel';
import type { Channel } from '@/types';

export function SearchChannelDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: channels, isLoading } = useSearchChannels(searchQuery);
  const { mutate: joinChannel, isPending } = useJoinChannel();

  const handleJoin = (channel: Channel) => {
    joinChannel(channel.id, {
      onSuccess: () => {
        setOpen(false);
        setSearchQuery('');
      },
    });
  };

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <Search className="h-5 w-5" />
      </Button>
    </DialogTrigger>

    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Channel Search</DialogTitle>
      </DialogHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search channel name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[300px] mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : channels && channels.length > 0 ? (
          <div className="space-y-2">
            {channels.map((channel) => (
              <ChannelSearchItem
                key={channel.id}
                channel={channel}
                onJoin={handleJoin}
                isLoading={isPending}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8 text-muted-foreground">
            No channels found
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Search for a channel name
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  </Dialog>
);
}

interface ChannelSearchItemProps {
  channel: Channel;
  onJoin: (channel: Channel) => void;
  isLoading: boolean;
}

function ChannelSearchItem({ channel, onJoin, isLoading }: ChannelSearchItemProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={channel.avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {channel.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <div className="flex items-center gap-1">
            <span className="font-medium">{channel.name}</span>
            {channel.isVerified && <VerifiedBadge />}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            @{channel.username}
            <span className="mx-1">•</span>
            <Users className="h-3 w-3" />
            {channel.memberCount}
          </p>
        </div>
      </div>

      {channel.isMember ? (
        <span className="text-sm text-muted-foreground">You are a member</span>
      ) : (
        <Button
          size="sm"
          onClick={() => onJoin(channel)}
          disabled={isLoading}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Join
        </Button>
      )}
    </div>
  );
}