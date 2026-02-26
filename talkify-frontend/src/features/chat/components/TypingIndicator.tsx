// src/features/chat/components/TypingIndicator.tsx

import { useSocketStore } from '@/store/useSocketStore';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';

interface TypingIndicatorProps {
  chatId: string;
}

export function TypingIndicator({ chatId }: TypingIndicatorProps) {
  const typingUsers = useSocketStore((state) => state.typingUsers);
  const activeChat = useChatStore((state) => state.activeChat);
  const currentUser = useAuthStore((state) => state.user);

  const typingInChat = typingUsers.get(chatId) || [];
  
  const othersTyping = typingInChat.filter((id) => id !== currentUser?.id);

  if (othersTyping.length === 0) return null;

  const typingUser = activeChat?.participants.find(
    (p) => p.id === othersTyping[0]
  );

  return (
    <div className="px-4 py-2 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <span>{typingUser?.username || 'User'} is typing...</span>
        <span className="flex gap-0.5">
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </span>
    </div>
  );
}