// src/features/channel/components/ChannelMessageBubble.tsx

import { useEffect, useState } from 'react';
import { Play, Download, FileIcon, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { MentionText } from '@/components/common/MentionText';
import { MediaViewer } from '@/components/common/MediaViewer';
import { formatTime } from '@/lib/utils';
import type { Message, User } from '@/types';
import { api } from '@/lib/api';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface ChannelMessageBubbleProps {
  message: Message;
}

export function ChannelMessageBubble({ message }: ChannelMessageBubbleProps) {
  const [sender, setSender] = useState<User | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchSender = async () => {
      try {
        const response = await api.get(`/users/${message.senderId}`);
        setSender(response.data.data);
      } catch (error) {
        console.error('Error fetching sender:', error);
      }
    };

    fetchSender();
  }, [message.senderId]);

  const fileUrl = message.fileUrl ? `${API_URL}${message.fileUrl}` : '';

  const formatSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    if (!fileUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = message.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const renderImage = () => {
    return (
      <>
        <img
          src={fileUrl}
          alt={message.fileName || 'Image'}
          className="max-w-[250px] max-h-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity object-cover"
          onClick={() => setMediaOpen(true)}
        />
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderVideo = () => {
    return (
      <>
        <div
          className="relative max-w-[250px] cursor-pointer group"
          onClick={() => setMediaOpen(true)}
        >
          <video src={fileUrl} className="rounded-lg max-h-[200px]" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg group-hover:bg-black/40 transition-colors">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderAudio = () => {
    return (
      <>
        <audio src={fileUrl} controls className="max-w-[250px]" />
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderFile = () => {
    return (
      <>
        <div
          className="flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
          onClick={handleDownload}
        >
          <FileIcon className="h-8 w-8 shrink-0 opacity-70" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.fileName || 'File'}</p>
            <p className="text-xs opacity-70">{formatSize(message.fileSize)}</p>
          </div>
          {isDownloading ? (
            <Loader2 className="h-5 w-5 animate-spin shrink-0" />
          ) : (
            <Download className="h-5 w-5 shrink-0 opacity-70" />
          )}
        </div>
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (message.isDeleted) {
      return <p className="italic opacity-50">🚫 This message has been deleted</p>;
    }

    switch (message.type) {
      case 'image':
        return renderImage();
      case 'video':
        return renderVideo();
      case 'audio':
        return renderAudio();
      case 'file':
        return renderFile();
      default:
        return (
          <p className="break-words whitespace-pre-wrap">
            <MentionText text={message.content || ''} />
          </p>
        );
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={sender?.avatar || undefined} />
          <AvatarFallback>
            {sender?.username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {sender?.username || 'Unknown'}
            </span>
            {sender?.isVerified && <VerifiedBadge />}
            <span className="text-xs text-muted-foreground">
              {formatTime(new Date(message.createdAt))}
            </span>
          </div>

          <div className="bg-muted rounded-lg rounded-tl-none px-4 py-2">
            {renderContent()}
          </div>
        </div>
      </div>

      {(message.type === 'image' || message.type === 'video') && message.fileUrl && (
        <MediaViewer
          open={mediaOpen}
          onOpenChange={setMediaOpen}
          type={message.type}
          url={fileUrl}
          fileName={message.fileName || undefined}
        />
      )}
    </>
  );
}