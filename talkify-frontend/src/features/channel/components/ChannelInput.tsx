// src/features/channel/components/ChannelInput.tsx

import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPickerButton } from '@/features/chat/components/EmojiPickerButton';
import { useChannelStore } from '@/store/useChannelStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useSendChannelMessage } from '../hooks/useSendChannelMessage';

export function ChannelInput() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChannel = useChannelStore((state) => state.activeChannel);
  const { isConnected } = useSocketStore();
  const { mutate: sendMessage, isPending } = useSendChannelMessage();

  const handleSend = () => {
    if (!message.trim() || !activeChannel || isPending) return;

    sendMessage(
      { channelId: activeChannel.id, content: message.trim() },
      {
        onSuccess: () => {
          setMessage('');
          textareaRef.current?.focus();
        },
      }
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-4 border-t bg-card">
      <div className="flex items-end gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
             isConnected ? 'Messaging the channel...' : 'Connecting...'
            }
            className="min-h-[44px] max-h-32 resize-none pr-10"
            rows={1}
            disabled={!isConnected || isPending}
          />
          <div className="absolute right-2 bottom-2">
            <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
          </div>
        </div>

        <Button
          onClick={handleSend}
          size="icon"
          disabled={!message.trim() || !isConnected || isPending}
          className="shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}