// src/features/settings/components/ProfileSheet.tsx

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Shield, Bell, Palette, LogOut } from 'lucide-react';
import { ProfileTab } from './ProfileTab';
import { AppearanceTab } from './AppearanceTab';
import { PrivacyTab } from './PrivacyTab';
import { NotificationsTab } from './NotificationsTab';
import { SecurityTab } from './SecurityTab';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { logout } = useAuth();

  const handleLogout = () => {
    onOpenChange(false);
    logout();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start gap-1 px-6 py-2 h-auto flex-wrap">
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>

            <TabsTrigger value="appearance" className="gap-1.5">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>

            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>

            <TabsTrigger value="privacy" className="gap-1.5">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>

            <TabsTrigger value="security" className="gap-1.5">
              <Settings className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0">
              <AppearanceTab />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <NotificationsTab />
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <PrivacyTab />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecurityTab onLogout={handleLogout} />
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}