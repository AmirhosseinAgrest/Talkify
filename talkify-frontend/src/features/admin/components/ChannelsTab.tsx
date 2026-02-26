// src/features/admin/components/ChannelsTab.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, BadgeX, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function ChannelsTab() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: channelsData, isLoading } = useQuery({
    queryKey: ['admin', 'channels'],
    queryFn: () => adminService.getAllChannels(),
  });

  const verifyMutation = useMutation({
    mutationFn: adminService.verifyChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Channel verified');
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: adminService.unverifyChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('Channel verification revoked');
    },
  });

  const filteredChannels =
    channelsData?.data.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>Channel Management</CardTitle>
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          channel.avatar
                            ? `${API_URL}${channel.avatar}`
                            : undefined
                        }
                      />
                      <AvatarFallback>
                        {channel.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{channel.name}</span>
                        {channel.isVerified && <VerifiedBadge />}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        @{channel.username} • {channel.memberCount} members
                      </p>
                    </div>
                  </div>

                  <div>
                    {channel.isVerified ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unverifyMutation.mutate(channel.id)}
                        disabled={unverifyMutation.isPending}
                        className="text-red-500 hover:text-red-600"
                      >
                        <BadgeX className="h-4 w-4 mr-1" />
                        Revoke Verification
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifyMutation.mutate(channel.id)}
                        disabled={verifyMutation.isPending}
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <BadgeCheck className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}