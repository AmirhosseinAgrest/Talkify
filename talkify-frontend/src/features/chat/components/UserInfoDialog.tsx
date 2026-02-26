// src/features/chat/components/UserInfoDialog.tsx

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { ReportUserDialog } from './ReportUserDialog';
import { SharedMediaSection } from './SharedMediaSection';
import {
  Flag,
  Ban,
  Calendar,
  AtSign,
  Phone,
  Mail,
  FileText,
  Loader2,
  UserX,
  UserCheck,
} from 'lucide-react';
import { blockService, BlockStatus } from '@/services/block.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface UserInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  chatId?: string;
}

export function UserInfoDialog({ open, onOpenChange, user, chatId }: UserInfoDialogProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const avatarUrl = user.avatar ? `${API_URL}${user.avatar}` : undefined;

  useEffect(() => {
    if (open && user.id) {
      loadBlockStatus();
    }
  }, [open, user.id]);

  const loadBlockStatus = async () => {
    setIsLoading(true);
    try {
      const response = await blockService.checkStatus(user.id);
      setBlockStatus(response.data);
    } catch (error) {
      console.error('Error loading block status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      await blockService.block(user.id);
      setBlockStatus({ ...blockStatus!, blockedByMe: true, isBlocked: true });
      toast.success('User blocked');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error blocking user');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async () => {
    setIsBlocking(true);
    try {
      await blockService.unblock(user.id);
      setBlockStatus({
        ...blockStatus!,
        blockedByMe: false,
        isBlocked: blockStatus?.blockedMe || false,
      });
      toast.success('User unblocked');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error unblocking user');
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <ScrollArea className="h-full">
            <div className="p-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex items-center justify-center mb-1">
                <h2 className="text-xl font-bold">{user.username}</h2>
                {user.isVerified && <VerifiedBadge size="1.2rem" />}
              </div>

              {user.bio && (
                <p className="text-muted-foreground mt-2">{user.bio}</p>
              )}

              <p className="text-sm mt-2">
                {user.isOnline ? (
                  <span className="text-green-500">Online</span>
                ) : (
                  <span className="text-muted-foreground">
                    Last seen: {formatDate(new Date(user.lastSeen))}
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div className="p-6 space-y-4">
              <h3 className="font-medium">Information</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <AtSign className="h-4 w-4 text-muted-foreground" />
                  <span>@{user.username}</span>
                </div>

                {user.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}

                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined: {formatDate(new Date(user.createdAt))}</span>
                </div>

                {user.bio && (
                  <div className="flex items-start gap-3 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{user.bio}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {chatId && (
              <>
                <SharedMediaSection chatId={chatId} />
                <Separator />
              </>
            )}

            <div className="p-6 space-y-3">
              {isLoading ? (
                <Button variant="outline" className="w-full" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : blockStatus?.blockedByMe ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUnblock}
                  disabled={isBlocking}
                >
                  {isBlocking ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  Unblock
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full text-orange-500 hover:text-orange-600"
                  onClick={handleBlock}
                  disabled={isBlocking}
                >
                  {isBlocking ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-2" />
                  )}
                  Block User
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full text-red-500 hover:text-red-600"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <ReportUserDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        user={user}
      />
    </>
  );
}