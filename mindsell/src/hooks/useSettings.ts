import { useCallback, useEffect, useState } from 'react';
import { type AppSettings, getSettings, saveSettings } from '../utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    soundEnabled: true,
    reminderEnabled: false,
    reminderTime: '08:00',
    reminderNotificationId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, isLoading, update };
}
