// src/features/admin/components/SuspensionsTab.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, Check, Loader2, Clock, Infinity, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuspendUserDialog } from './SuspendUserDialog';
import { suspensionService, Suspension } from '@/services/suspension.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function SuspensionsTab() {
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: activeData, isLoading: loadingActive } = useQuery({
    queryKey: ['admin', 'suspensions', 'active'],
    queryFn: () => suspensionService.getActive(),
  });

  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: ['admin', 'suspensions', 'all'],
    queryFn: () => suspensionService.getAll(),
  });

  const unsuspendMutation = useMutation({
    mutationFn: suspensionService.unsuspend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'suspensions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Suspension lifted');
    },
  });

  const formatDuration = (suspension: Suspension) => {
    if (suspension.isPermanent) {
      return 'Permanent';
    }

    const expiresAt = new Date(suspension.expiresAt);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let result = '';
    if (days > 0) result += `${days} days `;
    if (hours > 0) result += `${hours} hours `;
    if (minutes > 0) result += `${minutes} minutes`;

    return result || 'Less than a minute';
  };

  const SuspensionCard = ({ suspension, showActions = true }: { suspension: Suspension; showActions?: boolean }) => (
    <div className="p-4 rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserX className="h-5 w-5 text-orange-500" />
          <span className="font-medium">{suspension.username}</span>

          {suspension.isPermanent ? (
            <Badge variant="destructive" className="gap-1">
              <Infinity className="h-3 w-3" />
              Permanent
            </Badge>
          ) : suspension.isActive ? (
            <Badge variant="outline" className="text-orange-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatDuration(suspension)}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-500">
              <Check className="h-3 w-3 mr-1" />
              Lifted
            </Badge>
          )}
        </div>

        {showActions && suspension.isActive && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => unsuspendMutation.mutate(suspension.id)}
            disabled={unsuspendMutation.isPending}
          >
            {unsuspendMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Lift Suspension
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Suspended by:</span>{' '}
          <span>{suspension.adminUsername}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Date:</span>{' '}
          <span>{formatDate(new Date(suspension.createdAt))}</span>
        </div>
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground">Reason:</span>{' '}
        <span>{suspension.reason}</span>
      </div>

      {suspension.liftedAt && (
        <div className="text-sm text-green-600">
          Lifted by {suspension.liftedByUsername} on {formatDate(new Date(suspension.liftedAt))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Suspension Management
            </CardTitle>
            <Button onClick={() => setShowSuspendDialog(true)}>
              <Ban className="h-4 w-4 mr-2" />
              New User Suspension
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">
                Active ({activeData?.data.length || 0})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({allData?.data.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <ScrollArea className="h-[400px]">
                {loadingActive ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : activeData?.data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No suspended users found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeData?.data.map((suspension) => (
                      <SuspensionCard key={suspension.id} suspension={suspension} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="all">
              <ScrollArea className="h-[400px]">
                {loadingAll ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : allData?.data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No suspensions recorded
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allData?.data.map((suspension) => (
                      <SuspensionCard
                        key={suspension.id}
                        suspension={suspension}
                        showActions={suspension.isActive}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <SuspendUserDialog
        open={showSuspendDialog}
        onOpenChange={setShowSuspendDialog}
      />
    </>
  );
}