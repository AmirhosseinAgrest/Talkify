// src/pages/admin/AdminPage.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Radio,
  Flag,
  Ban,
  Loader2,
  ArrowRight,
  Megaphone,
  MessageSquare
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UsersTab } from '@/features/admin/components/UsersTab';
import { ChannelsTab } from '@/features/admin/components/ChannelsTab';
import { ReportsTab } from '@/features/admin/components/ReportsTab';
import { SuspensionsTab } from '@/features/admin/components/SuspensionsTab';
import { adminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/useAuthStore';
import { BroadcastTab } from '@/features/admin/components/BroadcastTab';
import { ManualMessageTab } from '@/features/admin/components/ManualMessageTab';

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('users');

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <Navigate to="/chat" replace />;
  }

  const { data: stats } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/chat">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Talkify Admin Panel</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats?.data.verifiedUsers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.data.totalChannels || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Online Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {stats?.data.onlineUsers || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>

            <TabsTrigger value="channels" className="gap-2">
              <Radio className="h-4 w-4" />
              Channels
            </TabsTrigger>

            <TabsTrigger value="reports" className="gap-2">
              <Flag className="h-4 w-4" />
              Reports
            </TabsTrigger>

            <TabsTrigger value="suspensions" className="gap-2">
              <Ban className="h-4 w-4" />
              Suspensions
            </TabsTrigger>

            <TabsTrigger value="broadcast" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Broadcast Message
            </TabsTrigger>

            <TabsTrigger value="manual" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Manual Message
            </TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast">
            <BroadcastTab />
          </TabsContent>
          <TabsContent value="manual">
            <ManualMessageTab />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="channels">
            <ChannelsTab />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>
          <TabsContent value="suspensions">
            <SuspensionsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}