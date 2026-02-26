// src/features/chat/components/ChatList.tsx

import { useChatStore } from '@/store/useChatStore';
import { useChats } from '../hooks/useChats';
import { ChatItem } from './ChatItem';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';

interface ChatListProps {
  searchQuery: string;
}

export function ChatList({ searchQuery }: ChatListProps) {
  const { isLoading } = useChats();
  const chats = useChatStore((state) => state.chats);

  const filteredChats = chats.filter((chat) =>
    chat.participants.some((p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (filteredChats.length === 0) {
    return (
      <EmptyState
        title="No chats found"
        description="Start a new chat"
      />
    );
  }

  return (
    <div className="p-2 space-y-1">
      {filteredChats.map((chat) => (
        <ChatItem key={chat.id} chat={chat} />
      ))}
    </div>
  );
}