// src/features/channel/components/ChannelHeader.tsx

import { useState } from 'react';
import { ArrowRight, Users, Settings, LogOut, Info } from 'lucide-react';
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
import { ChannelInfoDialog } from './ChannelInfoDialog';
import { useChannelStore } from '@/store/useChannelStore';
import { useUIStore } from '@/store/useUIStore';
import { useLeaveChannel } from '../hooks/useLeaveChannel';

export function ChannelHeader() {
  const [showInfo, setShowInfo] = useState(false);
  const activeChannel = useChannelStore((state) => state.activeChannel);
  const isMobile = useUIStore((state) => state.isMobile);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const { mutate: leaveChannel, isPending } = useLeaveChannel();

  if (!activeChannel) return null;

  const handleLeave = () => {
    if (confirm('Are you sure you want to leave this channel?')) {
      leaveChannel(activeChannel.id);
    }
  };

  return (
    <>
      <header className="h-16 px-4 flex items-center justify-between border-b bg-card">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}

          <Avatar>
            <AvatarImage src={activeChannel.avatar || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {activeChannel.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-1">
              <p className="font-medium">{activeChannel.name}</p>
              {activeChannel.isVerified && <VerifiedBadge />}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {activeChannel.memberCount} members
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowInfo(true)}>
              <Info className="h-4 w-4 mr-2" />
              Channel Information
            </DropdownMenuItem>

            {!activeChannel.isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLeave}
                  disabled={isPending}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave Channel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ChannelInfoDialog
        open={showInfo}
        onOpenChange={setShowInfo}
        channel={activeChannel}
      />
    </>
  );
}