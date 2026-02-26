// src/features/admin/components/SuspendUserDialog.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Ban, Clock, Infinity } from 'lucide-react';
import { suspensionService } from '@/services/suspension.service';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import type { User } from '@/types';

interface SuspendUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  userId?: string;
}

const DURATION_PRESETS = [
  { label: '1 hour', value: 3600 },
  { label: '6 hours', value: 21600 },
  { label: '1 day', value: 86400 },
  { label: '3 days', value: 259200 },
  { label: '1 week', value: 604800 },
  { label: '1 month', value: 2592000 },
  { label: 'Permanent', value: 'permanent' },
  { label: 'Custom', value: 'custom' },
];

export function SuspendUserDialog({ open, onOpenChange, user, userId }: SuspendUserDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(userId || user?.id || '');
  const [durationPreset, setDurationPreset] = useState<string>('86400');
  const [customDuration, setCustomDuration] = useState({ days: 0, hours: 0, minutes: 0 });
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminService.getAllUsers(),
    enabled: open && !user && !userId,
  });

  useEffect(() => {
    if (userId) setSelectedUserId(userId);
    if (user?.id) setSelectedUserId(user.id);
  }, [userId, user]);

  const suspendMutation = useMutation({
    mutationFn: ({ userId, duration, reason }: { userId: string; duration: number | 'permanent'; reason: string }) =>
      suspensionService.suspend(userId, duration, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('User suspended');
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to suspend user');
    },
  });

  const resetForm = () => {
    setSelectedUserId('');
    setDurationPreset('86400');
    setCustomDuration({ days: 0, hours: 0, minutes: 0 });
    setReason('');
  };

  const calculateDuration = (): number | 'permanent' => {
    if (durationPreset === 'permanent') return 'permanent';
    if (durationPreset === 'custom') {
      return (
        customDuration.days * 86400 +
        customDuration.hours * 3600 +
        customDuration.minutes * 60
      );
    }
    return parseInt(durationPreset);
  };

  const handleSubmit = () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    if (!reason) {
      toast.error('Please enter a suspension reason');
      return;
    }

    const duration = calculateDuration();
    if (duration !== 'permanent' && duration < 60) {
      toast.error('Suspension duration must be at least 1 minute');
      return;
    }

    suspendMutation.mutate({
      userId: selectedUserId,
      duration,
      reason,
    });
  };

  const suspendableUsers = usersData?.data.filter((u) => u.role === 'user' && !u.isSuspended) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-orange-500" />
            Suspend User
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!user && !userId && (
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {suspendableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.username} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(user || userId) && (
            <div className="p-3 bg-muted rounded-lg">
              <span className="text-sm text-muted-foreground">User:</span>{' '}
              <span className="font-medium">{user?.username || selectedUserId}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Suspension Duration</Label>
            <Select value={durationPreset} onValueChange={setDurationPreset}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_PRESETS.map((preset) => (
                  <SelectItem key={String(preset.value)} value={String(preset.value)}>
                    <span className="flex items-center gap-2">
                      {preset.value === 'permanent' && <Infinity className="h-4 w-4" />}
                      {preset.value === 'custom' && <Clock className="h-4 w-4" />}
                      {preset.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {durationPreset === 'custom' && (
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Days</Label>
                <Input
                  type="number"
                  min="0"
                  value={customDuration.days}
                  onChange={(e) =>
                    setCustomDuration({ ...customDuration, days: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hours</Label>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={customDuration.hours}
                  onChange={(e) =>
                    setCustomDuration({ ...customDuration, hours: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Minutes</Label>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={customDuration.minutes}
                  onChange={(e) =>
                    setCustomDuration({ ...customDuration, minutes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Suspension Reason</Label>
            <Textarea
              placeholder="Write the suspension reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={suspendMutation.isPending}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {suspendMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Suspending...
              </>
            ) : (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}