// src/store/useChatStore.ts

import { create } from 'zustand';
import type { Chat, Message, Reaction } from '@/types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;

  setChats: (chats: Chat[]) => void;
  setActiveChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addOptimisticMessage: (message: Message) => void;
  confirmOptimisticMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  updateMessageStatus: (messageId: string, status: Message['status']) => void;
  updateChatLastMessage: (chatId: string, message: Message) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  addReactionToMessage: (messageId: string, reaction: Reaction) => void;
  removeReactionFromMessage: (messageId: string, userId: string, emoji: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,

  setChats: (chats) => set({ chats }),

  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((m) => m.id === message.id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),

  addOptimisticMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  confirmOptimisticMessage: (serverMessage) =>
    set((state) => {
      const optimisticIndex = state.messages.findIndex(
        (m) =>
          m.status === 'sending' &&
          m.senderId === serverMessage.senderId &&
          m.content === serverMessage.content
      );

      if (optimisticIndex !== -1) {
        const newMessages = [...state.messages];
        newMessages[optimisticIndex] = serverMessage;
        return { messages: newMessages };
      }

      const exists = state.messages.some((m) => m.id === serverMessage.id);
      if (!exists) {
        return { messages: [...state.messages, serverMessage] };
      }

      return state;
    }),

  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    })),

  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    })),

  updateChatLastMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, lastMessage: message, updatedAt: message.createdAt }
          : chat
      ),
    })),

  updateUserOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      chats: state.chats.map((chat) => ({
        ...chat,
        participants: chat.participants.map((p) =>
          p.id === userId ? { ...p, isOnline } : p
        ),
      })),
    })),

  addReactionToMessage: (messageId, reaction) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
          : msg
      ),
    })),

  removeReactionFromMessage: (messageId, userId, emoji) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: (msg.reactions || []).filter(
                (r) => !(r.userId === userId && r.emoji === emoji)
              ),
            }
          : msg
      ),
    })),
}));