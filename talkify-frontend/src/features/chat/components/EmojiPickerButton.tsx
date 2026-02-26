// src/features/chat/components/EmojiPickerButton.tsx

import { useState } from 'react';
import { Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme } from 'next-themes';

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0" 
        align="end"
        side="top"
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
          lazyLoadEmojis
        />
      </PopoverContent>
    </Popover>
  );
}