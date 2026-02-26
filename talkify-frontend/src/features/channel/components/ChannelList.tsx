// src/features/channel/components/ChannelList.tsx

import { useChannelStore } from '@/store/useChannelStore';
import { useChannels } from '../hooks/useChannels';
import { ChannelItem } from './ChannelItem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Megaphone } from 'lucide-react';

interface ChannelListProps {
  searchQuery: string;
}

export function ChannelList({ searchQuery }: ChannelListProps) {
  const { isLoading } = useChannels();
  const channels = useChannelStore((state) => state.channels);

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (filteredChannels.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone className="h-16 w-16" />}
        title="Channel not found"
        description="Create a new channel"
      />
    );
  }

  return (
    <div className="p-2 space-y-1">
      {filteredChannels.map((channel) => (
        <ChannelItem key={channel.id} channel={channel} />
      ))}
    </div>
  );
}