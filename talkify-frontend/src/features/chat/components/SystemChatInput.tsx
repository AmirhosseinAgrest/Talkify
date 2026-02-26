// src/features/chat/components/SystemChatInput.tsx

import { Bot, Lock } from 'lucide-react';

export function SystemChatInput() {
  return (
    <div className="p-4 border-t bg-muted/50">
      <div className="flex items-center justify-center gap-3 text-muted-foreground">
        <Lock className="h-5 w-5" />
        <div className="text-center">
          <p className="font-medium">This is a system account</p>
          <p className="text-sm">You cannot send messages to this account</p>
        </div>
      </div>
    </div>
  );
}