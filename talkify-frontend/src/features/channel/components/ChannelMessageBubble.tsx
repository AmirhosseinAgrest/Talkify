// src/features/channel/components/ChannelMessageBubble.tsx

import { useState } from 'react';
import { Play, Download, Loader2, Image, Video, Music, File } from 'lucide-react';
import { MentionText } from '@/components/common/MentionText';
import { MediaViewer } from '@/components/common/MediaViewer';
import { formatTime } from '@/lib/utils';
import type { Message } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface ChannelMessageBubbleProps {
  message: Message;
}

const getFileType = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];

  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  return 'file';
};

const getFileIcon = (type: string) => {
  switch (type) {
    case 'image': return <Image className="h-5 w-5" />;
    case 'video': return <Video className="h-5 w-5" />;
    case 'audio': return <Music className="h-5 w-5" />;
    default: return <File className="h-5 w-5" />;
  }
};

export function ChannelMessageBubble({ message }: ChannelMessageBubbleProps) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const fileType = message.fileName ? getFileType(message.fileName) : 'file';

  const renderImage = () => {
    return (
      <>
        <img
          src={fileUrl}
          alt={message.fileName || 'Image'}
          className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setMediaOpen(true)}
        />
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap text-sm">
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
          className="relative max-w-[300px] rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => setMediaOpen(true)}
        >
          <video src={fileUrl} className="w-full rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <Play className="h-14 w-14 text-white fill-white" />
          </div>
        </div>
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap text-sm">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderAudio = () => {
    return (
      <>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 max-w-[300px]">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Music className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatSize(message.fileSize)}</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap text-sm">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderFile = () => {
    const icon = getFileIcon(fileType);

    return (
      <>
        <div
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors max-w-[300px]"
          onClick={handleDownload}
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{message.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatSize(message.fileSize)}</p>
          </div>
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
        {message.content && (
          <p className="mt-2 break-words whitespace-pre-wrap text-sm">
            <MentionText text={message.content} />
          </p>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (message.isDeleted) {
      return <p className="italic text-muted-foreground">This message has been deleted</p>;
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
          <p className="break-words whitespace-pre-wrap text-sm">
            <MentionText text={message.content || ''} />
          </p>
        );
    }
  };

  if (message.isDeleted) {
    return (
      <div className="px-4 py-1">
        <p className="text-sm text-muted-foreground italic">This message has been deleted</p>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-1.5">
        <div className="rounded-lg bg-muted px-4 py-2 max-w-[70%]">
          {renderContent()}
        </div>

        <div className="mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(new Date(message.createdAt))}
          </span>
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