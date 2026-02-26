// src/features/settings/components/NotificationsTab.tsx

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Volume2, MessageSquare, Users, Megaphone, Loader2 } from 'lucide-react';
import { userService, UserSettings } from '@/services/user.service';
import { toast } from 'sonner';

export function NotificationsTab() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    notifications: true,
    soundEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await userService.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await userService.updateSettings({ [key]: value });
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Error saving settings');
      setSettings(settings); // rollback
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Notifications</h3>
        </div>

        <div className="space-y-4 pr-8">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive alerts for new messages</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Sound</h3>
        </div>

        <div className="space-y-4 pr-8">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Message Sound</Label>
              <p className="text-sm text-muted-foreground">Play a sound when receiving messages</p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-medium">Notification Types</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Private Messages</Label>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Group Messages</Label>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label>Channel Messages</Label>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}