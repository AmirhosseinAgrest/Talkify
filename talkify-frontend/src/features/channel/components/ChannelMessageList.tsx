// src/features/channel/components/ChannelMessageList.tsx

import { useChannelStore } from '@/store/useChannelStore';
import { useChatScroll } from '@/features/chat/hooks/useChatScroll';
import { ChannelMessageBubble } from './ChannelMessageBubble';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Megaphone } from 'lucide-react';

interface ChannelMessageListProps {
  isLoading?: boolean;
}

export function ChannelMessageList({ isLoading }: ChannelMessageListProps) {
  const messages = useChannelStore((state) => state.messages);
  const scrollRef = useChatScroll(messages);

  if (isLoading) {
    return <LoadingSpinner className="flex-1" />;
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={<Megaphone className="h-16 w-16" />}
        title="No messages"
        description="No messages have been sent in this channel yet"
      />
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => (
        <ChannelMessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}