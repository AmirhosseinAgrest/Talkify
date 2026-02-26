// src/features/chat/components/ReplyPreview.tsx

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Message } from '@/types';

interface ReplyPreviewProps {
  message: Message;
  onCancel: () => void;
}

export function ReplyPreview({ message, onCancel }: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-t">
      <div className="w-1 h-10 bg-primary rounded-full" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">Replying to</p>
        <p className="text-sm text-muted-foreground truncate">
          {message.type === 'text'
            ? message.content
            : message.type === 'image'
              ? '🖼️ Image'
              : message.type === 'video'
                ? '🎬 Video'
                : message.type === 'audio'
                  ? '🎵 Audio'
                  : '📎 File'}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}