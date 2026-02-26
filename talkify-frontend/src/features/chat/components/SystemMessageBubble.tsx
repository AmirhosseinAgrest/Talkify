// src/features/chat/components/SystemMessageBubble.tsx

import { Bot, Bell, AlertTriangle, Ban, Megaphone, MessageSquare } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface SystemMessageBubbleProps {
  message: Message;
}

export function SystemMessageBubble({ message }: SystemMessageBubbleProps) {
  const getIcon = () => {
    switch (message.systemMessageType) {
      case 'welcome':
        return <Bot className="h-5 w-5" />;
      case 'suspension':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'block':
        return <Ban className="h-5 w-5 text-red-500" />;
      case 'broadcast':
        return <Megaphone className="h-5 w-5 text-blue-500" />;
      case 'manual':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.systemMessageType) {
      case 'suspension':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'block':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'broadcast':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-primary/5 border-primary/20';
    }
  };

  return (
    <div className="flex justify-start">
      <div
        className={cn(
          'max-w-[85%] rounded-2xl rounded-bl-md border p-4',
          getBackgroundColor()
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {getIcon()}
          </div>
          <div>
            <p className="font-medium text-sm">Talkify Support</p>
            <p className="text-xs text-muted-foreground">System Message</p>
          </div>
        </div>

        <div className="whitespace-pre-wrap text-sm">{message.content}</div>

        <div className="mt-2 text-xs text-muted-foreground text-left">
          {formatTime(new Date(message.createdAt))}
        </div>
      </div>
    </div>
  );
}