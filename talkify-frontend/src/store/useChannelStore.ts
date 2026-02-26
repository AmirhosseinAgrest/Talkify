// src/store/useChannelStore.ts

import { create } from 'zustand';
import type { Channel, Message } from '@/types';

interface ChannelState {
  channels: Channel[];
  activeChannel: Channel | null;
  messages: Message[];
  isLoading: boolean;

  setChannels: (channels: Channel[]) => void;
  setActiveChannel: (channel: Channel | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addOptimisticMessage: (message: Message) => void;
  confirmOptimisticMessage: (message: Message) => void;
  updateChannel: (channelId: string, updates: Partial<Channel>) => void;
  updateChannelLastMessage: (channelId: string, message: Message) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  activeChannel: null,
  messages: [],
  isLoading: false,

  setChannels: (channels) => set({ channels }),

  setActiveChannel: (channel) => set({ activeChannel: channel, messages: [] }),

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

      return state;
    }),

  updateChannel: (channelId, updates) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === channelId ? { ...ch, ...updates } : ch
      ),
      activeChannel:
        state.activeChannel?.id === channelId
          ? { ...state.activeChannel, ...updates }
          : state.activeChannel,
    })),

  updateChannelLastMessage: (channelId, message) =>
    set((state) => ({
      channels: state.channels.map((ch) =>
        ch.id === channelId
          ? { ...ch, lastMessage: message, updatedAt: message.createdAt }
          : ch
      ),
    })),
}));