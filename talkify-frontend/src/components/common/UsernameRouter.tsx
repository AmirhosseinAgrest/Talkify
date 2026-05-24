// src/components/common/UsernameRouter.tsx

import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';
import { channelService } from '@/services/channel.service';
import { chatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';
import { useChannelStore } from '@/store/useChannelStore';

import ChatPage from '@/pages/chat/ChatPage';
import ChannelPage from '@/pages/channel/ChannelPage';

type EntityType = 'user' | 'channel' | 'notfound' | 'loading';

const RESERVED_USERNAMES = ['404', 'login', 'register', 'admin', 'chat', 'channel', 'settings', 'profile'];

export function UsernameRouter() {
  const { username } = useParams<{ username: string }>();
  const [entityType, setEntityType] = useState<EntityType>('loading');
  const [refreshKey, setRefreshKey] = useState(0);
  
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const setActiveChannel = useChannelStore((state) => state.setActiveChannel);
  const setMessages = useChatStore((state) => state.setMessages);
  const setChannelMessages = useChannelStore((state) => state.setMessages);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setEntityType('notfound');
      return;
    }

    if (!username || RESERVED_USERNAMES.includes(username)) {
      setEntityType('notfound');
      return;
    }

    let isMounted = true;

    const detectEntity = async () => {
      try {
        const channelResult = await channelService.getChannelByUsername(username).catch(() => null);
        
        if (channelResult?.data && isMounted) {
          setChannelMessages([]);
          setMessages([]);
          setActiveChannel(channelResult.data);
          setActiveChat(null);
          setRefreshKey(prev => prev + 1);
          setEntityType('channel');
          return;
        }
        
        const chatResult = await chatService.findOrCreateChat(username).catch(() => null);
        
        if (chatResult?.data && isMounted) {
          setMessages([]);
          setChannelMessages([]);
          setActiveChat(chatResult.data);
          setActiveChannel(null);
          setRefreshKey(prev => prev + 1);
          setEntityType('user');
          return;
        }
        
        setEntityType('notfound');
      } catch (error) {
        console.error('Detection error:', error);
        if (isMounted) setEntityType('notfound');
      }
    };

    detectEntity();

    return () => {
      isMounted = false;
    };
  }, [username, token, isAuthenticated, setActiveChat, setActiveChannel, setMessages, setChannelMessages]);

  if (entityType === 'loading') {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (entityType === 'channel') {
    return <ChannelPage key={refreshKey} />;
  }

  if (entityType === 'user') {
    return <ChatPage key={refreshKey} />;
  }

  return <Navigate to="/404" replace />;
}