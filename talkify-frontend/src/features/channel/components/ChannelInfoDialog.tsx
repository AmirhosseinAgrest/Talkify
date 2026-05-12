// src/features/channel/components/ChannelInfoDialog.tsx

import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { Users, Calendar, AtSign, Shield, Edit2, X, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import type { Channel } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { channelService } from '@/services/channel.service';
import { useState, useRef, useEffect } from 'react';

interface ChannelInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel;
  onChannelUpdated?: (channel: Channel) => void;
}

export function ChannelInfoDialog({
  open,
  onOpenChange,
  channel,
  onChannelUpdated,
}: ChannelInfoDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(channel.name);
  const [username, setUsername] = useState(channel.username);
  const [description, setDescription] = useState(channel.description || '');
  const [avatar, setAvatar] = useState<string | null>(channel.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(channel.name);
      setUsername(channel.username);
      setDescription(channel.description || '');
      setAvatar(channel.avatar || null);
      setIsEditing(false); 
    }
  }, [channel, open]); 

  useEffect(() => {
    if (!isEditing) {
      setName(channel.name);
      setUsername(channel.username);
      setDescription(channel.description || '');
      setAvatar(channel.avatar || null);
    }
  }, [channel, isEditing]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(channel.name);
    setUsername(channel.username);
    setDescription(channel.description || '');
    setAvatar(channel.avatar || null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await channelService.updateChannel(channel.id, {
        name,
        username,
        description,
      });

      toast.success('Channel updated successfully');
      setIsEditing(false);
      
      const fullChannel = await channelService.getChannel(channel.id);
      onChannelUpdated?.(fullChannel.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update channel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarRemove = async () => {
    try {
      setIsSaving(true);
      await channelService.deleteAvatar(channel.id);
      setAvatar(null);
      toast.success('Avatar removed successfully');
      
      if (onChannelUpdated) {
        const fullChannel = await channelService.getChannel(channel.id);
        onChannelUpdated(fullChannel.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsSaving(true);
      const response = await channelService.uploadAvatar(channel.id, file);
      setAvatar(response.data.avatar ?? null);
      toast.success('Avatar uploaded successfully');
      
      if (onChannelUpdated) {
        const fullChannel = await channelService.getChannel(channel.id);
        onChannelUpdated(fullChannel.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const canEdit = channel.isOwner === true;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <ScrollArea className="h-full">
          <div className="p-6 pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />

                  {isEditing && canEdit && (
                    <div className="mt-3 flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatar ? 'Change avatar' : 'Add avatar'}
                      </Button>

                      {avatar && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleAvatarRemove}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mb-1">
                  {isEditing && canEdit ? (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="max-w-xs text-center"
                      placeholder="Channel name"
                    />
                  ) : (
                    <h2 className="text-xl font-bold">{channel.name}</h2>
                  )}
                  {channel.isVerified && <VerifiedBadge size="1.2rem" />}
                </div>

                <div className="text-center">
                  {isEditing && canEdit ? (
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="max-w-xs mx-auto text-center"
                      placeholder="username"
                    />
                  ) : (
                    <p className="text-muted-foreground">@{channel.username}</p>
                  )}
                </div>

                <div className="mt-4">
                  {isEditing && canEdit ? (
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                      placeholder="Channel description (optional)"
                    />
                  ) : (
                    channel.description && (
                      <p className="text-sm text-muted-foreground">
                        {channel.description}
                      </p>
                    )
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="ml-2">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        disabled={isSaving}
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditing(true)}
                      title="Edit channel"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="p-6 space-y-4">
            <h3 className="font-medium">Channel Information</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{channel.memberCount || 0} members</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <AtSign className="h-4 w-4 text-muted-foreground" />
                <span>@{channel.username}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Created: {formatDate(new Date(channel.createdAt))}</span>
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}