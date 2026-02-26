// src/components/common/MessageContextMenu.tsx

import { useState } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from '@/components/ui/context-menu';
import {
  Reply,
  Pencil,
  Trash2,
  Copy,
  SmilePlus,
} from 'lucide-react';
import type { Message } from '@/types';

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '👏', '🎉'];

interface MessageContextMenuProps {
  children: React.ReactNode;
  message: Message;
  isMine: boolean;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
  onReaction: (message: Message, emoji: string) => void;
}

export function MessageContextMenu({
  children,
  message,
  isMine,
  onReply,
  onEdit,
  onDelete,
  onReaction,
}: MessageContextMenuProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onReply(message)}>
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </ContextMenuItem>

        {message.type === 'text' && (
          <ContextMenuItem onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-2" />
            Copy text
          </ContextMenuItem>
        )}

        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <SmilePlus className="h-4 w-4 mr-2" />
            React
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="p-2">
            <div className="grid grid-cols-4 gap-1">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message, emoji)}
                  className="text-xl p-2 hover:bg-muted rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {isMine && !message.isDeleted && (
          <>
            <ContextMenuSeparator />

            {message.type === 'text' && (
              <ContextMenuItem onClick={() => onEdit(message)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </ContextMenuItem>
            )}

            <ContextMenuItem
              onClick={() => onDelete(message)}
              className="text-red-500 focus:text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}