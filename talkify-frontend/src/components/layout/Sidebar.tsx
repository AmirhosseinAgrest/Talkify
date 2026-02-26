// src/components/layout/Sidebar.tsx

import { useState } from 'react';
import { Search, LogOut, MessageSquare, Radio } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatList } from '@/features/chat/components/ChatList';
import { ChannelList } from '@/features/channel/components/ChannelList';
import { NewChatDialog } from '@/features/chat/components/NewChatDialog';
import { CreateChannelDialog } from '@/features/channel/components/CreateChannelDialog';
import { SearchChannelDialog } from '@/features/channel/components/SearchChannelDialog';
import { ProfileSheet } from '@/features/settings/components/ProfileSheet';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { useAuthStore } from '@/store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [profileOpen, setProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const avatarUrl = user?.avatar ? `${API_URL}${user.avatar}` : undefined;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-primary">Talkify</h1>
            <div className="flex gap-1">
              {activeTab === 'chats' && <NewChatDialog />}
              {activeTab === 'channels' && (
                <>
                  <SearchChannelDialog />
                  <CreateChannelDialog />
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'chats' ? 'Search chats...' : 'Search channels...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="chats" className="flex-1 gap-1">
              <MessageSquare className="h-4 w-4" />
              Chats
            </TabsTrigger>

            <TabsTrigger value="channels" className="flex-1 gap-1">
              <Radio className="h-4 w-4" />
              Channels
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="chats" className="mt-0">
              <ChatList searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="channels" className="mt-0">
              <ChannelList searchQuery={searchQuery} />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-4 border-t">
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-right"
          >
            <Avatar>
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>
                {user?.username?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-medium truncate">{user?.username}</p>
                {user?.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </button>
        </div>
      </div>

      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}