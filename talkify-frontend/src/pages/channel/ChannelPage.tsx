// src\pages\channel\ChannelPage.tsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChannelHeader } from '@/features/channel/components/ChannelHeader';
import { ChannelMessageList } from '@/features/channel/components/ChannelMessageList';
import { ChannelInput } from '@/features/channel/components/ChannelInput';
import { EmptyState } from '@/components/common/EmptyState';
import { useChannelMessages } from '@/features/channel/hooks/useChannelMessages';
import { useChannelStore } from '@/store/useChannelStore';
import { useSocketStore } from '@/store/useSocketStore';
import { Megaphone } from 'lucide-react';
import { channelService } from '@/services/channel.service';

export default function ChannelPage() {
  const { username } = useParams();
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isLoadingChannel, setIsLoadingChannel] = useState(true);
  
  const { isLoading: isLoadingMessages } = useChannelMessages(channelId || undefined);
  const activeChannel = useChannelStore((state) => state.activeChannel);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
  const { joinChannel, leaveChannel } = useSocketStore();

  useEffect(() => {
    const findChannelByUsername = async () => {
      if (!username) {
        setIsLoadingChannel(false);
        return;
      }

      setIsLoadingChannel(true);
      try {
        const response = await channelService.getChannelByUsername(username);
        const channel = response.data;
        
        setChannelId(channel.id);
        setActiveChannel(channel);
      } catch (error: any) {
        console.error('Error finding channel:', error);
        if (error.response?.status === 404) {
          setChannelId(null);
        } else {
          setChannelId(null);
        }
      } finally {
        setIsLoadingChannel(false);
      }
    };

    findChannelByUsername();
  }, [username, setActiveChannel]);

  useEffect(() => {
    if (channelId) {
      joinChannel(channelId);
    }

    return () => {
      if (channelId) {
        leaveChannel(channelId);
      }
    };
  }, [channelId, joinChannel, leaveChannel]);

  if (!username) {
    return (
      <EmptyState
        icon={<Megaphone className="h-16 w-16" />}
        title="No channel selected"
        description="Select a channel from the list on the right"
      />
    );
  }

  if (isLoadingChannel) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading channel...</p>
        </div>
      </div>
    );
  }

  if (!channelId) {
    return (
      <EmptyState
        icon={<Megaphone className="h-16 w-16" />}
        title="Channel not found"
        description={`Channel @${username} does not exist`}
      />
    );
  }

  const canSendMessage = activeChannel?.isOwner || activeChannel?.isAdmin;

  return (
    <div className="h-full flex flex-col">
      <ChannelHeader />
      <ChannelMessageList isLoading={isLoadingMessages} />
      {canSendMessage ? (
        <ChannelInput />
      ) : (
        <div className="p-4 text-center text-muted-foreground border-t">
          Only admins can send messages
        </div>
      )}
    </div>
  );
}