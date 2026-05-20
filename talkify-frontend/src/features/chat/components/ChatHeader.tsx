// src/features/chat/components/ChatHeader.tsx

import { useState } from 'react';
import { ArrowRight, MoreVertical, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const handleOpenUserInfo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowUserInfo(true);
  };

  return (
    <>
      <header
        className="h-16 px-4 flex items-center justify-between border-b bg-card cursor-pointer hover:bg-accent/5 transition-colors"
        onClick={handleOpenUserInfo}
      >
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(true);
              }}
              className="shrink-0"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Avatar 
              className="cursor-pointer shrink-0"
              onClick={handleOpenUserInfo}
            >
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {otherUser.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div onClick={handleOpenUserInfo} className="cursor-pointer min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="font-medium truncate">{otherUser.username}</p>
                {otherUser.isVerified && <VerifiedBadge size="1rem" />}
              </div>
              <p className="text-xs text-muted-foreground">
                {otherUser.isOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleOpenUserInfo}>
              <User className="h-4 w-4 mr-2" />
              <span>View Profile</span>
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