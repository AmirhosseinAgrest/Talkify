// src/store/useSocketStore.ts

import { create } from 'zustand';
import { createSocket, connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useChatStore } from './useChatStore';
import { useChannelStore } from './useChannelStore';
import { useAuthStore } from './useAuthStore';
import type { Message, Reaction } from '@/types';

interface SocketState {
  isConnected: boolean;
  typingUsers: Map<string, string[]>;

  initSocket: (token: string) => void;
  disconnect: () => void;
  
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, content: string, replyToId?: string | null) => void;
  editMessage: (chatId: string, messageId: string, content: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  addReaction: (chatId: string, messageId: string, emoji: string) => void;
  removeReaction: (chatId: string, messageId: string, emoji: string) => void;
  
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  sendChannelMessage: (channelId: string, content: string) => void;

  sendTyping: (chatId?: string, channelId?: string) => void;
  stopTyping: (chatId?: string, channelId?: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  typingUsers: new Map(),

  initSocket: (token: string) => {
    if (get().isConnected) {
      console.log('⚠️ Socket already connected');
      return;
    }

    if (!token) {
      console.log('⚠️ No token provided');
      return;
    }

    console.log('🔌 Creating socket connection...');
    const socket = createSocket(token);

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', (reason) => {
      set({ isConnected: false });
    });

    socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message);
      set({ isConnected: false });
    });

    socket.on('message:receive', (message: Message) => {
      console.log('📨 Message received:', message);

      const chatStore = useChatStore.getState();
      const currentUser = useAuthStore.getState().user;
      const activeChat = chatStore.activeChat;

      if (message.senderId === currentUser?.id) {
        chatStore.confirmOptimisticMessage(message);
      } else {
        if (activeChat && message.chatId === activeChat.id) {
          chatStore.addMessage(message);
        }
      }

      if (message.chatId) {
        chatStore.updateChatLastMessage(message.chatId, message);
      }
    });

    socket.on('message:edited', (message: Message) => {
      useChatStore.getState().updateMessage(message.id, message);
    });

    socket.on('message:deleted', (message: Message) => {
      useChatStore.getState().updateMessage(message.id, message);
    });

    socket.on('message:status', ({ messageId, status }) => {
      useChatStore.getState().updateMessageStatus(messageId, status);
    });

    socket.on('message:reaction:added', ({ messageId, reaction }: { messageId: string; reaction: Reaction }) => {
      useChatStore.getState().addReactionToMessage(messageId, reaction);
    });

    socket.on('message:reaction:removed', ({ messageId, emoji, userId }: { messageId: string; emoji: string; userId: string }) => {
      useChatStore.getState().removeReactionFromMessage(messageId, userId, emoji);
    });

    socket.on('channel:message:receive', (message: Message) => {

      const channelStore = useChannelStore.getState();
      const currentUser = useAuthStore.getState().user;
      const activeChannel = channelStore.activeChannel;

      if (message.senderId === currentUser?.id) {
        channelStore.confirmOptimisticMessage(message);
      } else {
        if (activeChannel && message.channelId === activeChannel.id) {
          channelStore.addMessage(message);
        }
      }

      if (message.channelId) {
        channelStore.updateChannelLastMessage(message.channelId, message);
      }
    });

    socket.on('typing:start', ({ userId, chatId, channelId }) => {
      const key = chatId || channelId;
      if (!key) return;

      set((state) => {
        const newTyping = new Map(state.typingUsers);
        const users = newTyping.get(key) || [];
        if (!users.includes(userId)) {
          newTyping.set(key, [...users, userId]);
        }
        return { typingUsers: newTyping };
      });
    });

    socket.on('typing:stop', ({ userId, chatId, channelId }) => {
      const key = chatId || channelId;
      if (!key) return;

      set((state) => {
        const newTyping = new Map(state.typingUsers);
        const users = newTyping.get(key) || [];
        newTyping.set(key, users.filter((id) => id !== userId));
        return { typingUsers: newTyping };
      });
    });

    socket.on('user:online', (userId: string) => {
      useChatStore.getState().updateUserOnlineStatus(userId, true);
    });

    socket.on('user:offline', (userId: string) => {
      useChatStore.getState().updateUserOnlineStatus(userId, false);
    });

    connectSocket();
  },

  disconnect: () => {
    console.log('🔌 Disconnecting socket...');
    disconnectSocket();
    set({ isConnected: false, typingUsers: new Map() });
  },

  joinChat: (chatId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('chat:join', chatId);
      console.log('🚪 Joined chat:', chatId);
    }
  },

  leaveChat: (chatId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('chat:leave', chatId);
    }
  },

  sendMessage: (chatId: string, content: string, replyToId?: string | null) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('message:send', { chatId, content, replyToId });
    }
  },

  editMessage: (chatId: string, messageId: string, content: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('message:edit', { chatId, messageId, content });
    }
  },

  deleteMessage: (chatId: string, messageId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('message:delete', { chatId, messageId });
    }
  },

  addReaction: (chatId: string, messageId: string, emoji: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('message:reaction:add', { chatId, messageId, emoji });
    }
  },

  removeReaction: (chatId: string, messageId: string, emoji: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('message:reaction:remove', { chatId, messageId, emoji });
    }
  },

  joinChannel: (channelId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('channel:join', channelId);
    }
  },

  leaveChannel: (channelId: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('channel:leave', channelId);
    }
  },

  sendChannelMessage: (channelId: string, content: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('channel:message:send', { channelId, content });
    }
  },

  sendTyping: (chatId?: string, channelId?: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('typing:start', { chatId, channelId });
    }
  },

  stopTyping: (chatId?: string, channelId?: string) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('typing:stop', { chatId, channelId });
    }
  },
}));