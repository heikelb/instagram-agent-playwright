import { useCallback, useEffect, useState } from 'react';
import {
  getCompletedTodayIds,
  getStreak,
  getUserName,
} from '../utils/storage';

interface StreakState {
  streak: number;
  completedTodayIds: number[];
  userName: string;
  isLoading: boolean;
}

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    streak: 0,
    completedTodayIds: [],
    userName: 'Champion',
    isLoading: true,
  });

  const refresh = useCallback(async () => {
    const [streak, completedTodayIds, userName] = await Promise.all([
      getStreak(),
      getCompletedTodayIds(),
      getUserName(),
    ]);
    setState({ streak, completedTodayIds, userName, isLoading: false });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
