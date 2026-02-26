// src/features/chat/components/FilePreview.tsx

import { useState } from 'react';
import { Download, Eye, FileIcon, Image, Film, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface FilePreviewProps {
  message: Message;
  isMine: boolean;
  onView: () => void;
}

export function FilePreview({ message, isMine, onView }: FilePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const fileUrl = `${API_URL}${message.fileUrl}`;

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

  const getIcon = () => {
    switch (message.type) {
      case 'image':
        return <Image className="h-6 w-6" />;
      case 'video':
        return <Film className="h-6 w-6" />;
      case 'audio':
        return <Mic className="h-6 w-6" />;
      default:
        return <FileIcon className="h-6 w-6" />;
    }
  };

  if (isMine || isDownloaded) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
              'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
            )}
          >
            <div className="shrink-0 opacity-70">{getIcon()}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <p className="text-xs opacity-70">{formatSize(message.fileSize)}</p>
            </div>

            <div className="flex items-center gap-1">
              {message.type === 'image' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Size: {formatSize(message.fileSize)}</p>
          <p>Type: {message.type}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}