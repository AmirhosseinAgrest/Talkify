// src/features/admin/components/BroadcastTab.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Send, Loader2, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { systemService, Broadcast } from '@/services/system.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function BroadcastTab() {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['admin', 'broadcasts'],
    queryFn: () => systemService.getBroadcastHistory(),
  });

  const broadcastMutation = useMutation({
    mutationFn: systemService.sendBroadcast,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'broadcasts'] });
      toast.success(`Message sent to ${response.data.sent} users`);
      setContent('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  const handleSend = () => {
    if (!content.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!confirm('Are you sure you want to send this message to all users?')) {
      return;
    }

    broadcastMutation.mutate(content);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Send Broadcast Message
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broadcast-content">Message</Label>
            <Textarea
              id="broadcast-content"
              placeholder={`Write your message...

This message will be sent to all users from the Talkify Support account.`}
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              This message will be sent to all non-admin users
            </p>
          </div>

          <Button
            onClick={handleSend}
            disabled={!content.trim() || broadcastMutation.isPending}
            className="w-full"
          >
            {broadcastMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to All
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Broadcast History
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px]">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : historyData?.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages have been sent
              </div>
            ) : (
              <div className="space-y-4">
                {historyData?.data.map((broadcast) => (
                  <div key={broadcast.id} className="p-3 rounded-lg border space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatDate(new Date(broadcast.createdAt))}
                      </span>

                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          {broadcast.sentTo}
                        </span>

                        {broadcast.failed > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="h-4 w-4" />
                            {broadcast.failed}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm whitespace-pre-wrap line-clamp-3">
                      {broadcast.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}