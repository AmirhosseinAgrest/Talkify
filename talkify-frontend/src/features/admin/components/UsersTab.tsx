// src/features/admin/components/UsersTab.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, BadgeX, Loader2, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import { SuspendUserDialog } from './SuspendUserDialog';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import type { User } from '@/types';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

export function UsersTab() {
  const [search, setSearch] = useState('');
  const [suspendingUser, setSuspendingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getAllUsers(),
  });

  const verifyMutation = useMutation({
    mutationFn: adminService.verifyUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('User verified');
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: adminService.unverifyUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('User verification revoked');
    },
  });

  const filteredUsers = usersData?.data.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle>User Management</CardTitle>
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
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar ? `${API_URL}${user.avatar}` : undefined} />
                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{user.username}</span>

                          {user.isVerified && <VerifiedBadge />}

                          {user.role === 'admin' && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-600 px-1.5 py-0.5 rounded">
                              Admin
                            </span>
                          )}

                          {user.role === 'super_admin' && (
                            <span className="text-xs bg-red-500/20 text-red-600 px-1.5 py-0.5 rounded">
                              Super Admin
                            </span>
                          )}

                          {user.isSuspended && (
                            <span className="text-xs bg-orange-500/20 text-orange-600 px-1.5 py-0.5 rounded">
                              Suspended
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {user.isOnline && (
                        <span className="text-xs text-green-500">Online</span>
                      )}

                      {user.isVerified ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => unverifyMutation.mutate(user.id)}
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
                          onClick={() => verifyMutation.mutate(user.id)}
                          disabled={verifyMutation.isPending}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <BadgeCheck className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}

                      {!user.isSuspended && user.role === 'user' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSuspendingUser(user)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
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

      <SuspendUserDialog
        open={!!suspendingUser}
        onOpenChange={() => setSuspendingUser(null)}
        user={suspendingUser}
      />
    </>
  );
}