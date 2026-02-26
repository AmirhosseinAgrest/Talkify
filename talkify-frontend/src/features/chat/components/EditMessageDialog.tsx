// src/features/chat/components/EditMessageDialog.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { Message } from '@/types';

interface EditMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  onSave: (messageId: string, content: string) => void;
  isLoading?: boolean;
}

export function EditMessageDialog({
  open,
  onOpenChange,
  message,
  onSave,
  isLoading,
}: EditMessageDialogProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (message) {
      setContent(message.content);
    }
  }, [message]);

  const handleSave = () => {
    if (message && content.trim()) {
      onSave(message.id, content.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Edit your message..."
          rows={4}
          className="resize-none"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}