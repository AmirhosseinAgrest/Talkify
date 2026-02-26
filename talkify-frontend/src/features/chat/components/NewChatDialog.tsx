// src/features/chat/components/NewChatDialog.tsx

import { useState } from 'react';
import { Search, MessageSquarePlus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchUsers } from '../hooks/useSearchUsers';
import { useCreateChat } from '../hooks/useCreateChat';
import type { User } from '@/types';

export function NewChatDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: users, isLoading } = useSearchUsers(searchQuery);
  const { mutate: createChat, isPending } = useCreateChat();

  const handleSelectUser = (user: User) => {
    createChat(user.id, {
      onSuccess: () => {
        setOpen(false);
        setSearchQuery('');
      },
    });
  };

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon">
        <MessageSquarePlus className="h-5 w-5" />
      </Button>
    </DialogTrigger>
    
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New Chat</DialogTitle>
      </DialogHeader>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-[300px] mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : users && users.length > 0 ? (
          <div className="space-y-2">
            {users.map((user) => (
              <UserItem
                key={user.id}
                user={user}
                onSelect={handleSelectUser}
                isLoading={isPending}
              />
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Search by username or email
          </div>
        )}
      </ScrollArea>
    </DialogContent>
  </Dialog>
);
}

interface UserItemProps {
  user: User;
  onSelect: (user: User) => void;
  isLoading: boolean;
}

function UserItem({ user, onSelect, isLoading }: UserItemProps) {
  return (
    <button
      onClick={() => onSelect(user)}
      disabled={isLoading}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={user.avatar || undefined} />
          <AvatarFallback>
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {user.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      <div className="flex-1 text-right">
        <p className="font-medium">{user.username}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      {user.isOnline ? (
        <span className="text-xs text-green-500">Online</span>
      ) : (
        <span className="text-xs text-muted-foreground">Offline</span>
      )}
    </button>
  );
}