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
import { toast } from 'sonner';
import type { Channel } from '@/types';

export function ChannelHeader() {
  const [showInfo, setShowInfo] = useState(false);
  const activeChannel = useChannelStore((state) => state.activeChannel);
  const updateChannel = useChannelStore((state) => state.updateChannel);
  const isMobile = useUIStore((state) => state.isMobile);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const { mutate: leaveChannel, isPending } = useLeaveChannel();

  if (!activeChannel) return null;

  const handleLeave = () => {
    if (confirm(`Are you sure you want to leave "${activeChannel.name}"?`)) {
      leaveChannel(activeChannel.id, {
        onSuccess: () => {
          toast.success(`Left ${activeChannel.name}`);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to leave channel');
        }
      });
    }
  };

  const handleChannelUpdated = (updatedChannel: Channel) => {
    updateChannel(updatedChannel.id, {
      name: updatedChannel.name,
      username: updatedChannel.username,
      description: updatedChannel.description,
      avatar: updatedChannel.avatar,
      isVerified: updatedChannel.isVerified,
      memberCount: updatedChannel.memberCount,
    });
  };

  const handleOpenInfo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowInfo(true);
  };

  return (
    <>
      <header
        className="h-16 px-4 flex items-center justify-between border-b bg-card cursor-pointer hover:bg-accent/5 transition-colors"
        onClick={handleOpenInfo}
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
              onClick={handleOpenInfo}
            >
              <AvatarImage src={activeChannel.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {activeChannel.name?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>

            <div onClick={handleOpenInfo} className="cursor-pointer min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="font-medium truncate">{activeChannel.name}</p>
                {activeChannel.isVerified && <VerifiedBadge size="1rem" />}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3 shrink-0" />
                <span>{activeChannel.memberCount?.toLocaleString() || 0} members</span>
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
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleOpenInfo}>
              <Info className="h-4 w-4 mr-2" />
              <span>Channel Information</span>
            </DropdownMenuItem>

            {!activeChannel.isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLeave}
                  disabled={isPending}
                  className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>{isPending ? 'Leaving...' : 'Leave Channel'}</span>
                </DropdownMenuItem>
              </>
            )}

            {activeChannel.isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => {
                    toast.info('Delete channel feature coming soon');
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Delete Channel</span>
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
        onChannelUpdated={handleChannelUpdated}
      />
    </>
  );
}