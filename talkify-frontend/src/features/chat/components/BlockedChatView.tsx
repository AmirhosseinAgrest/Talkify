// src/features/chat/components/BlockedChatView.tsx

import { Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlockedChatViewProps {
  blockedByMe: boolean;
  onUnblock?: () => void;
}

export function BlockedChatView({ blockedByMe, onUnblock }: BlockedChatViewProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
        <Ban className="h-8 w-8 text-red-500" />
      </div>

      {blockedByMe ? (
        <>
          <h3 className="text-lg font-medium mb-2">You have blocked this user</h3>
          <p className="text-muted-foreground mb-4">
            To send messages, you must unblock the user first
          </p>
          {onUnblock && (
            <Button onClick={onUnblock}>Unblock</Button>
          )}
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium mb-2">You are blocked</h3>
          <p className="text-muted-foreground">
            This user has blocked you and messaging is not possible
          </p>
        </>
      )}
    </div>
  );
}