// src/features/admin/components/ReportsTab.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Loader2, Eye, Ban, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SuspendUserDialog } from './SuspendUserDialog';
import { reportService, Report, REPORT_REASONS } from '@/services/report.service';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function ReportsTab() {
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState('');
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin', 'reports', statusFilter],
    queryFn: () => reportService.getAll(statusFilter === 'all' ? undefined : statusFilter),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ reportId, resolution }: { reportId: string; resolution: string }) =>
      reportService.review(reportId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Report reviewed');
      setSelectedReport(null);
      setResolution('');
    },
  });

  const dismissMutation = useMutation({
    mutationFn: reportService.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      toast.success('Report dismissed');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-yellow-500">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="outline" className="text-green-500">
            <Check className="h-3 w-3 mr-1" /> Reviewed
          </Badge>
        );
      case 'dismissed':
        return (
          <Badge variant="outline" className="text-red-500">
            <X className="h-3 w-3 mr-1" /> Dismissed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReasonLabel = (reason: string) => {
    return REPORT_REASONS.find((r) => r.id === reason)?.label || reason;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reports
            </CardTitle>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : reportsData?.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports found
              </div>
            ) : (
              <div className="space-y-3">
                {reportsData?.data.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(report.status)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(new Date(report.createdAt))}
                        </span>
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-500"
                            onClick={() => setSuspendingUserId(report.reportedId)}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500"
                            onClick={() => dismissMutation.mutate(report.id)}
                            disabled={dismissMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reporter:</span>{' '}
                        <span className="font-medium">{report.reporterUsername}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reported user:</span>{' '}
                        <span className="font-medium">{report.reportedUsername}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Reason:</span>{' '}
                      <Badge variant="secondary">{getReasonLabel(report.reason)}</Badge>
                    </div>

                    {report.description && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Description:</span>{' '}
                        <span>{report.description}</span>
                      </div>
                    )}

                    {report.resolution && (
                      <div className="text-sm bg-muted p-2 rounded">
                        <span className="text-muted-foreground">Resolution:</span>{' '}
                        <span>{report.resolution}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Reporter:</span>
                  <p className="font-medium">{selectedReport.reporterUsername}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reported user:</span>
                  <p className="font-medium">{selectedReport.reportedUsername}</p>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-sm">Reason:</span>
                <p>{getReasonLabel(selectedReport.reason)}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <span className="text-muted-foreground text-sm">Description:</span>
                  <p>{selectedReport.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Resolution</Label>
                <Textarea
                  placeholder="Write the resolution..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              Cancel
            </Button>

            <Button
              onClick={() => {
                if (selectedReport) {
                  reviewMutation.mutate({
                    reportId: selectedReport.id,
                    resolution,
                  });
                }
              }}
              disabled={!resolution || reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuspendUserDialog
        open={!!suspendingUserId}
        onOpenChange={() => setSuspendingUserId(null)}
        userId={suspendingUserId || undefined}
      />
    </>
  );
}