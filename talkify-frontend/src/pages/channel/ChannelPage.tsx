// src/pages/channel/ChannelPage.tsx

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChannelHeader } from '@/features/channel/components/ChannelHeader';
import { ChannelMessageList } from '@/features/channel/components/ChannelMessageList';
import { ChannelInput } from '@/features/channel/components/ChannelInput';
import { EmptyState } from '@/components/common/EmptyState';
import { useChannelMessages } from '@/features/channel/hooks/useChannelMessages';
import { useChannelStore } from '@/store/useChannelStore';
import { useSocketStore } from '@/store/useSocketStore';
import { Megaphone } from 'lucide-react';

export default function ChannelPage() {
  const { channelId } = useParams();
  const { isLoading } = useChannelMessages(channelId);
  const activeChannel = useChannelStore((state) => state.activeChannel);
  const { joinChannel, leaveChannel } = useSocketStore();

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

  if (!channelId) {
    return (
      <EmptyState
        icon={<Megaphone className="h-16 w-16" />}
        title="No channel selected"
        description="Select a channel from the list on the right"
      />
    );
  }

  const canSendMessage = activeChannel?.isOwner || activeChannel?.isAdmin;

  return (
    <div className="h-full flex flex-col">
      <ChannelHeader />
      <ChannelMessageList isLoading={isLoading} />
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