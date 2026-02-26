// src/features/chat/components/UploadingMessage.tsx

import { X, FileIcon, Image, Film, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadingMessageProps {
  file: File;
  progress: number;
  onCancel: () => void;
}

export function UploadingMessage({ file, progress, onCancel }: UploadingMessageProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadedSize = (file.size * progress) / 100;

  const getIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (file.type.startsWith('video/')) return <Film className="h-8 w-8" />;
    if (file.type.startsWith('audio/')) return <Mic className="h-8 w-8" />;
    return <FileIcon className="h-8 w-8" />;
  };

  const getPreview = () => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="max-w-[200px] max-h-[150px] rounded-lg object-cover opacity-50"
        />
      );
    }
    return null;
  };

  return (
    <div className="flex justify-end mb-2">
      <div className="max-w-[70%] bg-primary/80 text-primary-foreground rounded-2xl rounded-br-md p-3">
        {getPreview()}

        <div className="flex items-center gap-3 mt-2">
          <div className="shrink-0 opacity-70">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs opacity-70">
              {formatSize(uploadedSize)} / {formatSize(file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8 hover:bg-white/20"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-center mt-1 opacity-70">
            {progress < 100 ? `Uploading... ${progress}%` : 'Processing...'}
          </p>
        </div>
      </div>
    </div>
  );
}