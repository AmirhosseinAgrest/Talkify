// src/features/channel/components/ChannelInfoDialog.tsx

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { Users, Calendar, AtSign, Shield } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Channel } from '@/types';

interface ChannelInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel;
}

export function ChannelInfoDialog({
  open,
  onOpenChange,
  channel,
}: ChannelInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Channel Information</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={channel.avatar || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {channel.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold">{channel.name}</h3>
            {channel.isVerified && <VerifiedBadge />}
          </div>

          <p className="text-muted-foreground">@{channel.username}</p>

          {channel.description && (
            <p className="mt-4 text-sm">{channel.description}</p>
          )}
        </div>

        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{channel.memberCount} members</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <AtSign className="h-4 w-4 text-muted-foreground" />
            <span>@{channel.username}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created at: {formatDate(new Date(channel.createdAt))}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>
              Your role:{' '}
              {channel.isOwner
                ? 'Owner'
                : channel.isAdmin
                  ? 'Admin'
                  : 'Member'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}