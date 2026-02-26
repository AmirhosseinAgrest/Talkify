// src/features/chat/components/MessageList.tsx

import { useChatStore } from '@/store/useChatStore';
import { useChatScroll } from '../hooks/useChatScroll';
import { MessageBubble } from './MessageBubble';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import type { Message } from '@/types';

interface MessageListProps {
  isLoading?: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onReaction: (message: Message, emoji: string) => void;
}

export function MessageList({
  isLoading,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageListProps) {
  const messages = useChatStore((state) => state.messages);
  const scrollRef = useChatScroll(messages);

  if (isLoading) {
    return <LoadingSpinner className="flex-1" />;
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        description="Send the first message!"
      />
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onReaction={onReaction}
        />
      ))}
    </div>
  );
}