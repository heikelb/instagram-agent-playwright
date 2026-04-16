import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { saveSettings } from '../utils/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }, []);

  const scheduleDaily = useCallback(
    async (timeStr: string): Promise<string | null> => {
      if (Platform.OS === 'web') return null;

      const granted = await requestPermission();
      if (!granted) return null;

      // Cancel existing reminder
      await Notifications.cancelAllScheduledNotificationsAsync();

      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'MindSell 🔥',
          body: 'C\'est l\'heure de ta session. Prêt à dominer ?',
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      await saveSettings({ reminderNotificationId: id });
      return id;
    },
    [requestPermission]
  );

  const cancelReminder = useCallback(async () => {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await saveSettings({ reminderNotificationId: null });
  }, []);

  return { requestPermission, scheduleDaily, cancelReminder };
}
