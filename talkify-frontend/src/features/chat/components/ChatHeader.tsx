// src/features/chat/components/ChatHeader.tsx

import { useState } from 'react';
import { ArrowRight, MoreVertical, User, Flag, Ban, Trash } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { UserInfoDialog } from './UserInfoDialog';
import { useChatStore } from '@/store/useChatStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function ChatHeader() {
  const [showUserInfo, setShowUserInfo] = useState(false);
  const activeChat = useChatStore((state) => state.activeChat);
  const currentUser = useAuthStore((state) => state.user);
  const isMobile = useUIStore((state) => state.isMobile);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  const otherUser = activeChat?.participants.find((p) => p.id !== currentUser?.id);

  if (!otherUser) return null;

  const avatarUrl = otherUser.avatar ? `${API_URL}${otherUser.avatar}` : undefined;

  return (
    <>
      <header className="h-16 px-4 flex items-center justify-between border-b bg-card">
        <button
          onClick={() => setShowUserInfo(true)}
          className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
        >
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}

          <Avatar>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>
              {otherUser.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-right">
            <div className="flex items-center gap-1">
              <p className="font-medium">{otherUser.username}</p>
              {otherUser.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-xs text-muted-foreground">
              {otherUser.isOnline ? (
                <span className="text-green-500">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowUserInfo(true)}>
              <User className="h-4 w-4 mr-2" />
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <UserInfoDialog
        open={showUserInfo}
        onOpenChange={setShowUserInfo}
        user={otherUser}
        chatId={activeChat?.id}
      />
    </>
  );
}