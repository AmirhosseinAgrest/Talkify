// src/pages/chat/ChatPage.tsx

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatHeader } from '@/features/chat/components/ChatHeader';
import { MessageList } from '@/features/chat/components/MessageList';
import { ChatInput } from '@/features/chat/components/ChatInput';
import { EditMessageDialog } from '@/features/chat/components/EditMessageDialog';
import { TypingIndicator } from '@/features/chat/components/TypingIndicator';
import { BlockedChatView } from '@/features/chat/components/BlockedChatView';
import { SuspendedView } from '@/features/chat/components/SuspendedView';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useMessages } from '@/features/chat/hooks/useMessages';
import { useChatStore } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSocketStore } from '@/store/useSocketStore';
import { blockService, BlockStatus } from '@/services/block.service';
import { suspensionService, Suspension } from '@/services/suspension.service';
import { SystemChatInput } from '@/features/chat/components/SystemChatInput';
import { toast } from 'sonner';
import type { Message } from '@/types';
import { chatService } from '@/services/chat.service';

export default function ChatPage() {
  const { username } = useParams<{ username: string }>();
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const { isLoading } = useMessages(chatId || undefined);
  const activeChat = useChatStore((state) => state.activeChat);
  const currentUser = useAuthStore((state) => state.user);
  const { joinChat, leaveChat, editMessage, deleteMessage, addReaction } = useSocketStore();

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [blockStatus, setBlockStatus] = useState<BlockStatus | null>(null);
  const [suspension, setSuspension] = useState<Suspension | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    const findChatByUsername = async () => {
      if (!username || !currentUser) return;

      setIsLoadingUser(true);
      try {
        const chatRes = await chatService.findOrCreateChat(username);
        setChatId(chatRes.data.id);
      } catch (error) {
        console.error('Error finding chat:', error);
        toast.error('Failed to load chat');
      } finally {
        setIsLoadingUser(false);
      }
    };

    findChatByUsername();
  }, [username, currentUser]);

  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
    }
    return () => {
      if (chatId) {
        leaveChat(chatId);
      }
    };
  }, [chatId, joinChat, leaveChat]);

  useEffect(() => {
    const otherUser = activeChat?.participants.find((p) => p.id !== currentUser?.id);
    if (otherUser?.id) {
      checkStatus(otherUser.id);
    }
  }, [activeChat, currentUser?.id]);

  const checkStatus = async (userId: string) => {
    setIsCheckingStatus(true);
    try {
      const blockRes = await blockService.checkStatus(userId);
      setBlockStatus(blockRes.data);

      const suspensionRes = await suspensionService.checkMySuspension();
      setSuspension(suspensionRes.data);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    setReplyTo(null);
    setEditingMessage(null);
    setIsEditDialogOpen(false);
    setBlockStatus(null);
    setSuspension(null);
  }, [chatId]);

  const handleReply = (message: Message) => setReplyTo(message);
  const handleCancelReply = () => setReplyTo(null);

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = (messageId: string, content: string) => {
    if (chatId) {
      editMessage(chatId, messageId, content);
      setIsEditDialogOpen(false);
      setEditingMessage(null);
      toast.success('Message edited');
    }
  };

  const handleDelete = (message: Message) => {
    if (chatId && confirm('Are you sure you want to delete this message?')) {
      deleteMessage(chatId, message.id);
      toast.success('Message deleted');
    }
  };

  const handleReaction = (message: Message, emoji: string) => {
    if (chatId) {
      addReaction(chatId, message.id, emoji);
    }
  };

  const handleUnblock = async () => {
    const otherUser = activeChat?.participants.find((p) => p.id !== currentUser?.id);
    if (!otherUser?.id) return;

    try {
      await blockService.unblock(otherUser.id);
      setBlockStatus({
        ...blockStatus!,
        blockedByMe: false,
        isBlocked: blockStatus?.blockedMe || false,
      });
      toast.success('User unblocked');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error unblocking user');
    }
  };

  if (!username) {
    return (
      <EmptyState
        title="No user selected"
        description="Select a user from the list on the right"
      />
    );
  }

  if (isLoadingUser) {
    return <LoadingSpinner className="flex-1" />;
  }

  if (!chatId) {
    return (
      <EmptyState
        title="Chat not found"
        description="Could not find or create a chat with this user"
      />
    );
  }

  if (isLoading || isCheckingStatus) {
    return <LoadingSpinner className="flex-1" />;
  }

  if (suspension) {
    return (
      <div className="h-full flex flex-col">
        <ChatHeader />
        <SuspendedView suspension={suspension} />
      </div>
    );
  }

  if (blockStatus?.isBlocked) {
    return (
      <div className="h-full flex flex-col">
        <ChatHeader />
        <BlockedChatView
          blockedByMe={blockStatus.blockedByMe}
          onUnblock={blockStatus.blockedByMe ? handleUnblock : undefined}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader />

      <MessageList
        isLoading={isLoading}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReaction={handleReaction}
      />

      <TypingIndicator chatId={chatId} />

      {activeChat?.participants.some((p) => p.isSystemAccount) ? (
        <SystemChatInput />
      ) : (
        <ChatInput replyTo={replyTo} onCancelReply={handleCancelReply} />
      )}

      <EditMessageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        message={editingMessage}
        onSave={handleSaveEdit}
      />
    </div>
  );
}