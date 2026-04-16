import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  STREAK: '@mindsell/streak',
  LAST_SESSION_DATE: '@mindsell/lastSessionDate',
  COMPLETED_TODAY: '@mindsell/completedToday',
  USER_NAME: '@mindsell/userName',
  SETTINGS: '@mindsell/settings',
} as const;

export interface AppSettings {
  soundEnabled: boolean;
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM"
  reminderNotificationId: string | null;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  reminderEnabled: false,
  reminderTime: '08:00',
  reminderNotificationId: null,
};

// ── Streak ────────────────────────────────────────────────────────────────────

export async function getStreak(): Promise<number> {
  const val = await AsyncStorage.getItem(KEYS.STREAK);
  return val ? parseInt(val, 10) : 0;
}

export async function getLastSessionDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.LAST_SESSION_DATE);
}

/**
 * Call after completing a session. Handles streak logic:
 * - Same day → no change to streak, just mark completed
 * - Yesterday → streak + 1
 * - Older → reset to 1
 */
export async function recordSessionCompletion(sessionId: number): Promise<number> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const lastDate = await getLastSessionDate();
  const currentStreak = await getStreak();

  let newStreak = currentStreak;

  if (lastDate === null || lastDate === undefined) {
    newStreak = 1;
  } else if (lastDate === today) {
    // Already played today — keep streak
    newStreak = currentStreak;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 1;
    }
  }

  // Update completed sessions for today
  const completedRaw = await AsyncStorage.getItem(KEYS.COMPLETED_TODAY);
  const completedData = completedRaw ? JSON.parse(completedRaw) : { date: today, ids: [] };
  if (completedData.date !== today) {
    completedData.date = today;
    completedData.ids = [];
  }
  if (!completedData.ids.includes(sessionId)) {
    completedData.ids.push(sessionId);
  }

  await AsyncStorage.multiSet([
    [KEYS.STREAK, String(newStreak)],
    [KEYS.LAST_SESSION_DATE, today],
    [KEYS.COMPLETED_TODAY, JSON.stringify(completedData)],
  ]);

  return newStreak;
}

export async function getCompletedTodayIds(): Promise<number[]> {
  const today = new Date().toISOString().split('T')[0];
  const raw = await AsyncStorage.getItem(KEYS.COMPLETED_TODAY);
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (data.date !== today) return [];
  return data.ids as number[];
}

export async function resetStreak(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.STREAK,
    KEYS.LAST_SESSION_DATE,
    KEYS.COMPLETED_TODAY,
  ]);
}

// ── User name ─────────────────────────────────────────────────────────────────

export async function getUserName(): Promise<string> {
  const val = await AsyncStorage.getItem(KEYS.USER_NAME);
  return val ?? 'Champion';
}

export async function setUserName(name: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_NAME, name.trim() || 'Champion');
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (!raw) return { ...DEFAULT_SETTINGS };
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
}
