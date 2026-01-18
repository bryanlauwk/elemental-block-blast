import { useState, useEffect, useCallback } from 'react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  playedToday: boolean;
}

const STREAK_KEY = 'elemental-blast-streak';

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

export function useDailyStreak() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    playedToday: false,
  });

  // Load streak data on mount
  useEffect(() => {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StreakData;
        const today = getToday();
        const yesterday = getYesterday();
        
        // Check if streak is still valid
        if (parsed.lastPlayedDate === today) {
          // Already played today, streak is current
          setStreakData({ ...parsed, playedToday: true });
        } else if (parsed.lastPlayedDate === yesterday) {
          // Played yesterday, streak continues but not played today
          setStreakData({ ...parsed, playedToday: false });
        } else {
          // Streak broken - reset current but keep longest
          setStreakData({
            currentStreak: 0,
            longestStreak: parsed.longestStreak,
            lastPlayedDate: parsed.lastPlayedDate,
            playedToday: false,
          });
        }
      } catch {
        // Invalid data, reset
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastPlayedDate: null,
          playedToday: false,
        });
      }
    }
  }, []);

  // Record that a game was played today
  const recordPlay = useCallback(() => {
    setStreakData(prev => {
      const today = getToday();
      const yesterday = getYesterday();
      
      let newStreak = prev.currentStreak;
      
      if (prev.lastPlayedDate !== today) {
        // First play of the day
        if (prev.lastPlayedDate === yesterday) {
          // Continuing streak
          newStreak = prev.currentStreak + 1;
        } else {
          // Starting new streak
          newStreak = 1;
        }
      }
      
      const newData: StreakData = {
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastPlayedDate: today,
        playedToday: true,
      };
      
      localStorage.setItem(STREAK_KEY, JSON.stringify(newData));
      return newData;
    });
  }, []);

  // Get streak multiplier for scoring (1.0 to 2.0)
  const getStreakMultiplier = useCallback((): number => {
    // 10% bonus per day of streak, max 100% bonus (2x)
    return Math.min(1 + (streakData.currentStreak * 0.1), 2.0);
  }, [streakData.currentStreak]);

  // Check if streak is at risk (played yesterday but not today)
  const isStreakAtRisk = useCallback((): boolean => {
    if (streakData.currentStreak === 0) return false;
    const yesterday = getYesterday();
    return streakData.lastPlayedDate === yesterday && !streakData.playedToday;
  }, [streakData]);

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    playedToday: streakData.playedToday,
    recordPlay,
    getStreakMultiplier,
    isStreakAtRisk: isStreakAtRisk(),
  };
}
