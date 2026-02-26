// src/features/chat/components/ChatInput.tsx

import { useState, useRef, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmojiPickerButton } from './EmojiPickerButton';
import { FileUploadButton } from './FileUploadButton';
import { ReplyPreview } from './ReplyPreview';
import { UploadingMessage } from './UploadingMessage';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';
import { chatService } from '@/services/chat.service';
import { toast } from 'sonner';
import type { Message } from '@/types';

interface ChatInputProps {
  replyTo: Message | null;
  onCancelReply: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  controller: AbortController;
}

export function ChatInput({ replyTo, onCancelReply }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = useChatStore((state) => state.activeChat);
  const addOptimisticMessage = useChatStore((state) => state.addOptimisticMessage);
  const user = useAuthStore((state) => state.user);
  const { sendMessage, sendTyping, stopTyping, isConnected } = useSocketStore();

  const handleSend = () => {
    if (!message.trim() || !activeChat || !user) return;

    const content = message.trim();

    const optimisticMessage: Message = {
      id: uuidv4(),
      chatId: activeChat.id,
      senderId: user.id,
      content: content,
      type: 'text',
      fileUrl: null,
      fileName: null,
      fileSize: null,
      replyToId: replyTo?.id || null,
      replyTo: replyTo
        ? {
          id: replyTo.id,
          content: replyTo.content,
          type: replyTo.type,
          senderId: replyTo.senderId,
        }
        : null,
      isEdited: false,
      isDeleted: false,
      reactions: [],
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addOptimisticMessage(optimisticMessage);
    sendMessage(activeChat.id, content, replyTo?.id);

    setMessage('');
    onCancelReply();
    stopTyping(activeChat.id);
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (file: File) => {
    if (!activeChat) return;

    const controller = new AbortController();
    setUploadingFile({ file, progress: 0, controller });

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (replyTo) {
        formData.append('replyToId', replyTo.id);
      }

      await chatService.sendMessageWithFile(activeChat.id, formData, (progress) => {
        setUploadingFile((prev) => (prev ? { ...prev, progress } : null));
      });

      onCancelReply();
      toast.success('File sent');
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        toast.error(error.response?.data?.message || 'Error sending file');
      }
    } finally {
      setUploadingFile(null);
    }
  };

  const handleCancelUpload = () => {
    if (uploadingFile) {
      uploadingFile.controller.abort();
      setUploadingFile(null);
      toast.info('Upload canceled');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    if (activeChat) {
      if (value) {
        sendTyping(activeChat.id);
      } else {
        stopTyping(activeChat.id);
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t bg-card">
      {uploadingFile && (
        <div className="p-4 pb-0">
          <UploadingMessage
            file={uploadingFile.file}
            progress={uploadingFile.progress}
            onCancel={handleCancelUpload}
          />
        </div>
      )}

      {replyTo && !uploadingFile && (
        <ReplyPreview message={replyTo} onCancel={onCancelReply} />
      )}

      <div className="p-4">
        <div className="flex items-end gap-2">
          <FileUploadButton
            onFileSelect={handleFileSelect}
            disabled={!isConnected || !!uploadingFile}
          />

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !isConnected
                  ? 'Connecting...'
                  : 'Type your message...'
              }
              className="min-h-[44px] max-h-32 resize-none pr-10"
              rows={1}
              disabled={!isConnected}
            />
            <div className="absolute right-2 bottom-2">
              <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>

          <Button
            onClick={handleSend}
            size="icon"
            disabled={!message.trim() || !isConnected}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}