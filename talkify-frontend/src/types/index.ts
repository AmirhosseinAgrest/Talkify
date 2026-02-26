// src/types/index.ts

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  bio?: string;
  phone?: string;
  isOnline: boolean;
  lastSeen: string;
  isVerified: boolean;
  isSystemAccount?: boolean;
  isSuspended?: boolean;
  suspendedUntil?: string;
  role: 'user' | 'admin' | 'super_admin' | 'system'; 
  settings?: UserSettings;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  chatId?: string;
  channelId?: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    content: string;
    type: string;
    senderId: string;
  } | null;
  isEdited: boolean;
  isDeleted: boolean;
  isSystemMessage?: boolean;
  systemMessageType?: string;
  reactions: Reaction[];
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  participants: User[];
  participantIds?: string[];
  isSystemChat?: boolean;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  username: string;
  description?: string;
  avatar?: string | null;
  ownerId: string;
  owner?: Partial<User>;
  adminIds: string[];
  memberIds: string[];
  memberCount: number;
  isVerified: boolean;
  lastMessage?: Message;
  isMember?: boolean;
  isAdmin?: boolean;
  isOwner?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateChannelForm {
  name: string;
  username: string;
  description?: string;
}

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  onlineUsers: number;
  totalChannels: number;
  verifiedChannels: number;
  totalMessages: number;
  totalChats: number;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'fa' | 'en';
  notifications: boolean;
  soundEnabled: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
}
