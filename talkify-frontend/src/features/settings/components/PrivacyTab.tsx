// src/features/settings/components/PrivacyTab.tsx

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { userService, UserSettings } from '@/services/user.service';
import { toast } from 'sonner';

export function PrivacyTab() {
  const [settings, setSettings] = useState<Partial<UserSettings>>({
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
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
      setSettings(settings);
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
          <Eye className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Visibility</h3>
        </div>

        <div className="space-y-4 pr-8">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show online status</Label>
              <p className="text-sm text-muted-foreground">
                Others can see when you're online
              </p>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => updateSetting('showOnlineStatus', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Last seen</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Show the time of your last activity
              </p>
            </div>
            <Switch
              checked={settings.showLastSeen}
              onCheckedChange={(checked) => updateSetting('showLastSeen', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <CheckCheck className="h-4 w-4 text-muted-foreground" />
                <Label>Read receipts</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Show blue ticks when you read messages
              </p>
            </div>
            <Switch
              checked={settings.showReadReceipts}
              onCheckedChange={(checked) => updateSetting('showReadReceipts', checked)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          ⚠️ If you disable these settings, you also won’t be able to see this information from others.
        </p>
      </div>
    </div>
  );
}