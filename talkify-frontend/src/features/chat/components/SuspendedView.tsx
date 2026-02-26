// src/features/chat/components/SuspendedView.tsx

import { AlertTriangle } from 'lucide-react';
import type { Suspension } from '@/services/suspension.service';

interface SuspendedViewProps {
  suspension: Suspension;
}

export function SuspendedView({ suspension }: SuspendedViewProps) {
  const formatDuration = () => {
    if (suspension.isPermanent) {
      return 'Permanent';
    }

    const expiresAt = new Date(suspension.expiresAt);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let result = '';
    if (days > 0) result += `${days} days `;
    if (hours > 0) result += `${hours} hours `;
    if (minutes > 0) result += `${minutes} minutes`;

    return result || 'Less than a minute';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
      </div>

      <h3 className="text-lg font-medium mb-2">Your account has been suspended</h3>

      <p className="text-muted-foreground mb-2">
        Reason: {suspension.reason}
      </p>

      <p className="text-muted-foreground">
        Time remaining: {formatDuration()}
      </p>

      <p className="text-sm text-muted-foreground mt-4">
        During this period, you can still view channel content, but you cannot send messages.
      </p>
    </div>
  );
}