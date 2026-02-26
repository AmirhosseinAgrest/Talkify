// src/components/common/EmptyState.tsx

import { MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ 
  icon = <MessageSquare className="h-16 w-16" />, 
  title, 
  description 
}: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="text-muted-foreground/50 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}