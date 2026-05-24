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

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface ChatItemProps {
  chat: Chat;
}

const getTextDirection = (text: string): 'rtl' | 'ltr' => {
  if (!text) return 'ltr';
  
  const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/;
  
  const sampleText = text.slice(0, 20);
  
  if (rtlRegex.test(sampleText)) {
    return 'rtl';
  }
  return 'ltr';
};

export function ChatItem({ chat }: ChatItemProps) {
  const navigate = useNavigate();
  const { username } = useParams();
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const currentUser = useAuthStore((state) => state.user);

  const otherUser = chat.participants.find((p) => p.id !== currentUser?.id);
  const isSystemAccount = otherUser?.isSystemAccount;

  const isActive = username === otherUser?.username;

  const handleClick = () => {
    if (isActive) return;

    setActiveChat(chat);
    navigate(`/${otherUser?.username}`);
  };

  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return undefined;
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
      return avatar;
    }
    if (avatar.startsWith('/')) {
      return `${API_URL}${avatar}`;
    }
    return `${API_URL}/${avatar}`;
  };

  const lastMessageContent = chat.lastMessage?.content || 'Start the conversation...';
  const messageDirection = getTextDirection(lastMessageContent);

  return (
    <button
      onClick={handleClick}
      disabled={isActive}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
        isActive
          ? 'bg-primary/10 text-primary cursor-default opacity-70'
          : 'hover:bg-muted cursor-pointer'
      )}
    >
      <div className="relative">
        {isSystemAccount ? (
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
        ) : (
          <Avatar>
            <AvatarImage src={getAvatarUrl(otherUser?.avatar)} />
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
            <p className={cn(
              "font-medium truncate",
              isActive && "text-primary"
            )}>
              {otherUser?.username}
            </p>
            {(isSystemAccount || otherUser?.isVerified) && <VerifiedBadge />}
            {isSystemAccount && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                System
              </span>
            )}
          </div>

          {chat.lastMessage && (
            <span className="text-xs text-muted-foreground shrink-0">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>

        <p 
          className="text-sm text-muted-foreground truncate"
          style={{
            direction: messageDirection,
            textAlign: messageDirection === 'rtl' ? 'right' : 'left',
            display: 'block',
            width: '100%'
          }}
        >
          {lastMessageContent}
        </p>
      </div>

      {chat.unreadCount > 0 && !isActive && (
        <span className="flex items-center justify-center h-5 min-w-5 px-1 bg-primary text-primary-foreground text-xs rounded-full shrink-0">
          {chat.unreadCount}
        </span>
      )}
    </button>
  );
}