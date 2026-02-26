// src/features/settings/components/AppearanceTab.tsx

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'light', name: 'Light', icon: Sun },
  { id: 'dark', name: 'Dark', icon: Moon },
  { id: 'system', name: 'System', icon: Monitor },
];

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                theme === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted hover:bg-muted/80'
              )}
            >
              <t.icon className="h-6 w-6" />
              <span className="text-sm font-medium">{t.name}</span>
              {theme === t.id && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Preview</h4>
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="bg-muted rounded-lg rounded-bl-none p-3">
                <p className="text-sm">Hi! This is a sample message.</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="h-8 w-8 rounded-full bg-primary/20" />
            <div className="flex-1">
              <div className="bg-primary text-primary-foreground rounded-lg rounded-br-none p-3">
                <p className="text-sm">Hey! I'm good, thanks. How about you?</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium">Font Size</h4>
        <div className="flex items-center gap-4">
          <span className="text-xs">Small</span>
          <input
            type="range"
            min="12"
            max="18"
            defaultValue="14"
            className="flex-1"
          />
          <span className="text-lg">Large</span>
        </div>
        <p className="text-xs text-muted-foreground">
          This setting will be available soon
        </p>
      </div>
    </div>
  );
}