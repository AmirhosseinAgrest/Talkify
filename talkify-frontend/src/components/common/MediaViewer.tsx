// src/components/common/MediaViewer.tsx

import { useState } from 'react';
import { X, Download, Play, Pause } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MediaViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'image' | 'video' | 'audio';
  url: string;
  fileName?: string;
}

export function MediaViewer({
  open,
  onOpenChange,
  type,
  url,
  fileName,
}: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'download';
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-medium truncate">{fileName || 'File'}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center p-4 bg-black/90 min-h-[400px]">
          {type === 'image' && (
            <img
              src={url}
              alt={fileName}
              className="max-w-full max-h-[70vh] object-contain"
            />
          )}

          {type === 'video' && (
            <video
              src={url}
              controls
              autoPlay
              className="max-w-full max-h-[70vh]"
            />
          )}

          {type === 'audio' && (
            <div className="w-full max-w-md">
              <audio src={url} controls className="w-full" autoPlay />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}