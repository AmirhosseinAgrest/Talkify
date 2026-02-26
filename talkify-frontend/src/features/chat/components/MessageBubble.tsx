// src/features/chat/components/MessageBubble.tsx

import { useState } from 'react';
import { Check, CheckCheck, Clock, Play, Download, FileIcon, Pencil, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/useAuthStore';
import { MessageContextMenu } from '@/components/common/MessageContextMenu';
import { MediaViewer } from '@/components/common/MediaViewer';
import { formatTime } from '@/lib/utils';
import { SystemMessageBubble } from './SystemMessageBubble';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface MessageBubbleProps {
  message: Message;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onReaction: (message: Message, emoji: string) => void;
}

export function MessageBubble({
  message,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageBubbleProps) {
  if (message.isSystemMessage) {
    return <SystemMessageBubble message={message} />;
  }
  const [mediaOpen, setMediaOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const currentUser = useAuthStore((state) => state.user);
  const isMine = message.senderId === currentUser?.id;

  const fileUrl = message.fileUrl ? `${API_URL}${message.fileUrl}` : '';

  const formatSize = (bytes: number | null | undefined) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
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
      setIsDownloaded(true);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const StatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 opacity-50" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'seen':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const renderReply = () => {
    if (!message.replyTo) return null;

    const getReplyContent = () => {
      switch (message.replyTo?.type) {
        case 'image':
          return '🖼️ Image';
        case 'video':
          return '🎬 Video';
        case 'audio':
          return '🎵 Audio';
        case 'file':
          return '📎 File';
        default:
          return message.replyTo?.content || '';
      }
    };

    return (
      <div
        className={cn(
          'mb-2 p-2 rounded-lg border-r-2',
          isMine
            ? 'bg-white/10 border-white/50'
            : 'bg-black/5 dark:bg-white/5 border-primary'
        )}
      >
        <p className={cn('text-xs font-medium', isMine ? 'text-white/70' : 'text-primary')}>
          Reply to message
        </p>
        <p className={cn('text-sm truncate', isMine ? 'text-white/80' : 'opacity-70')}>
          {getReplyContent()}
        </p>
      </div>
    );
  };

  const renderImage = () => {
    if (!isMine && !isDownloaded) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="relative max-w-[250px] rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setMediaOpen(true)}
              >
                <img
                  src={fileUrl}
                  alt={message.fileName || 'Image'}
                  className="w-full blur-sm"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download ({formatSize(message.fileSize)})
                  </Button>
                </div>
              </div>
            </TooltipTrigger>

            <TooltipContent>
              <p>Name: {message.fileName}</p>
              <p>Size: {formatSize(message.fileSize)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <img
        src={fileUrl}
        alt={message.fileName || 'Image'}
        className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setMediaOpen(true)}
      />
    );
  };

  const renderVideo = () => {
    if (!isMine && !isDownloaded) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative max-w-[250px] rounded-lg overflow-hidden">
                <div className="w-full h-[150px] bg-black/20 flex flex-col items-center justify-center">
                  <Play className="h-12 w-12 text-white/50 mb-2" />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download ({formatSize(message.fileSize)})
                  </Button>
                </div>
              </div>
            </TooltipTrigger>

            <TooltipContent>
              <p>Name: {message.fileName}</p>
              <p>Size: {formatSize(message.fileSize)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div
        className="relative max-w-[250px] cursor-pointer group"
        onClick={() => setMediaOpen(true)}
      >
        <video src={fileUrl} className="rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg group-hover:bg-black/40 transition-colors">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
    );
  };

  const renderAudio = () => {
    if (!isMine && !isDownloaded) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  🎵
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{message.fileName}</p>
                  <p className="text-xs opacity-70">{formatSize(message.fileSize)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download first to play</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <audio src={fileUrl} controls className="max-w-[250px]" />;
  };

  const renderFile = () => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                isMine
                  ? 'bg-white/10 hover:bg-white/20'
                  : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
              )}
              onClick={handleDownload}
            >
              <FileIcon className="h-8 w-8 shrink-0 opacity-70" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{message.fileName}</p>
                <p className="text-xs opacity-70">{formatSize(message.fileSize)}</p>
              </div>
              {isDownloading ? (
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
              ) : (
                <Download className="h-5 w-5 shrink-0 opacity-70" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to download</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderContent = () => {
    if (message.isDeleted) {
      return <p className="italic opacity-50">🚫 This message has been deleted</p>;
    }

    switch (message.type) {
      case 'image':
        return (
          <>
            {renderImage()}
            {message.content && <p className="mt-2 break-words">{message.content}</p>}
          </>
        );

      case 'video':
        return (
          <>
            {renderVideo()}
            {message.content && <p className="mt-2 break-words">{message.content}</p>}
          </>
        );

      case 'audio':
        return (
          <>
            {renderAudio()}
            {message.content && <p className="mt-2 break-words">{message.content}</p>}
          </>
        );

      case 'file':
        return (
          <>
            {renderFile()}
            {message.content && <p className="mt-2 break-words">{message.content}</p>}
          </>
        );

      default:
        return <p className="break-words whitespace-pre-wrap">{message.content}</p>;
    }
  };

  const renderReactions = () => {
    if (!message.reactions?.length) return null;

    const grouped = message.reactions.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {Object.entries(grouped).map(([emoji, count]) => (
          <span
            key={emoji}
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full cursor-pointer transition-colors',
              isMine
                ? 'bg-white/20 hover:bg-white/30'
                : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20'
            )}
            onClick={() => onReaction(message, emoji)}
          >
            {emoji} {count > 1 && count}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <MessageContextMenu
        message={message}
        isMine={isMine}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onReaction={onReaction}
      >
        <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
          <div
            className={cn(
              'max-w-[70%] px-4 py-2 rounded-2xl',
              isMine
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted rounded-bl-md',
              message.status === 'sending' && 'opacity-70'
            )}
          >
            {renderReply()}
            {renderContent()}
            {renderReactions()}

            <div
              className={cn(
                'flex items-center gap-1 mt-1 text-xs',
                isMine ? 'justify-end' : 'justify-start'
              )}
            >
              {message.isEdited && !message.isDeleted && (
                <span className="opacity-50 flex items-center gap-0.5">
                  <Pencil className="h-2.5 w-2.5" />
                  Edited
                </span>
              )}
              <span className="opacity-70">
                {formatTime(new Date(message.createdAt))}
              </span>
              {isMine && <StatusIcon />}
            </div>
          </div>
        </div>
      </MessageContextMenu>

      {(message.type === 'image' || message.type === 'video' || message.type === 'audio') &&
        message.fileUrl && (
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