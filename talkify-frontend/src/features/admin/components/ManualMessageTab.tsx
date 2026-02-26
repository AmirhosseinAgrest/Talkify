// src/features/admin/components/ManualMessageTab.tsx

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageSquare, Send, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { adminService } from '@/services/admin.service';
import { systemService } from '@/services/system.service';
import { toast } from 'sonner';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function ManualMessageTab() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [content, setContent] = useState('');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getAllUsers(),
  });

  const sendMutation = useMutation({
    mutationFn: ({ userId, content }: { userId: string; content: string }) =>
      systemService.sendMessage(userId, content),
    onSuccess: () => {
      toast.success('Message sent');
      setContent('');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  const filteredUsers =
    usersData?.data.filter(
      (u) =>
        !u.isSystemAccount &&
        (u.username.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()))
    ) || [];

  const handleSend = () => {
    if (!selectedUser || !content.trim()) {
      toast.error('User and message content are required');
      return;
    }

    sendMutation.mutate({ userId: selectedUser.id, content });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Select User
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${selectedUser?.id === user.id
                        ? 'bg-primary/10 border-primary border'
                        : 'hover:bg-muted border border-transparent'
                      }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.avatar ? `${API_URL}${user.avatar}` : undefined}
                      />
                      <AvatarFallback>
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-right">
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Message
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar>
                  <AvatarImage
                    src={
                      selectedUser.avatar
                        ? `${API_URL}${selectedUser.avatar}`
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {selectedUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{selectedUser.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Write your message..."
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={!content.trim() || sendMutation.isPending}
                className="w-full"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a user
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}