// src/features/channel/components/ChannelInput.tsx

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip, Loader2, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPickerButton } from '@/features/chat/components/EmojiPickerButton';
import { useChannelStore } from '@/store/useChannelStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useSendChannelMessage } from '../hooks/useSendChannelMessage';
import { useSendChannelFile } from '../hooks/useSendChannelFile';
import { toast } from 'sonner';

export function ChannelInput() {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChannel = useChannelStore((state) => state.activeChannel);
  const { isConnected } = useSocketStore();
  
  const { mutate: sendMessage, isPending: isTextPending } = useSendChannelMessage();
  const { mutate: sendFile, isPending: isFilePending } = useSendChannelFile();
  
  const isPending = isTextPending || isFilePending;

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (!activeChannel) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (message.trim()) {
        formData.append('content', message.trim());
      }

      sendFile(
        { channelId: activeChannel.id, formData },
        {
          onSuccess: () => {
            setMessage('');
            setSelectedFile(null);
            setFilePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            textareaRef.current?.focus();
          },
        }
      );
      return;
    }

    if (!message.trim() || isPending) return;

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
      {selectedFile && (
        <div className="mb-3 p-2 bg-muted rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="h-10 w-10 rounded object-cover" />
            ) : (
              <File className="h-8 w-8 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf,.txt,.doc,.docx"
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? 'Message the channel...' : 'Connecting...'}
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
          disabled={(!message.trim() && !selectedFile) || !isConnected || isPending}
          className="shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}