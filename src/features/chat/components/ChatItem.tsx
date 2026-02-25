// src/features/chat/components/ChatItem.tsx

import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { Bot } from 'lucide-react';
import type { Chat } from '@/types';

interface ChatItemProps {
  chat: Chat;
}

export function ChatItem({ chat }: ChatItemProps) {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const currentUser = useAuthStore((state) => state.user);

  const otherUser = chat.participants.find((p) => p.id !== currentUser?.id);
  const isSystemAccount = otherUser?.isSystemAccount;
  const isActive = chatId === chat.id;

  const handleClick = () => {
    setActiveChat(chat);
    navigate(`/chat/${chat.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-right transition-colors',
        isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
      )}
    >
      <div className="relative">
        {isSystemAccount ? (
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
        ) : (
          <Avatar>
            <AvatarImage src={otherUser?.avatar ? `${import.meta.env.VITE_API_URL}${otherUser.avatar}` : undefined} />
            <AvatarFallback>
              {otherUser?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {(isSystemAccount || otherUser?.isOnline) && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p className="font-medium truncate">{otherUser?.username}</p>
            {(isSystemAccount || otherUser?.isVerified) && <VerifiedBadge />}
            {isSystemAccount && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                System
              </span>
            )}
          </div>

          {chat.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {chat.lastMessage?.content || 'Start the conversation...'}
        </p>
      </div>

      {chat.unreadCount > 0 && (
        <span className="flex items-center justify-center h-5 min-w-5 px-1 bg-primary text-primary-foreground text-xs rounded-full">
          {chat.unreadCount}
        </span>
      )}
    </button>
  );
}