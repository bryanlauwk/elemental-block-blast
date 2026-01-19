import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { containsProfanity } from '@/utils/profanityFilter';

export type TimePeriod = 'day' | 'week' | 'month' | 'all';
export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export function useGlobalLeaderboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTimeFilter = useCallback((period: TimePeriod): Date | null => {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'all':
        return null;
    }
  }, []);

  const fetchLeaderboard = useCallback(async (period: TimePeriod = 'all', limit: number = 20): Promise<LeaderboardEntry[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const timeFilter = getTimeFilter(period);
      
      let query = supabase
        .from('leaderboard')
        .select('id, player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(limit);

      if (timeFilter) {
        query = query.gte('created_at', timeFilter.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [getTimeFilter]);

  // Sanitize player name for security
  const sanitizePlayerName = useCallback((name: string): string => {
    return name
      .replace(/[<>'"&\\]/g, '') // Remove HTML-sensitive characters
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim()
      .slice(0, 20); // Enforce max length
  }, []);

  // Score validation constants (must match database constraints)
  const MAX_SCORE = 10000000;
  const MIN_SCORE = 1;

  const validateScore = useCallback((score: number): { valid: boolean; error?: string } => {
    if (!Number.isInteger(score)) {
      return { valid: false, error: 'Score must be a whole number' };
    }
    if (score < MIN_SCORE) {
      return { valid: false, error: 'Score must be positive' };
    }
    if (score > MAX_SCORE) {
      return { valid: false, error: 'Score exceeds maximum allowed value' };
    }
    return { valid: true };
  }, []);

  const submitScore = useCallback(async (playerName: string, score: number): Promise<{ success: boolean; rank?: number }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate score before submission
      const scoreValidation = validateScore(score);
      if (!scoreValidation.valid) {
        throw new Error(scoreValidation.error);
      }

      const sanitizedName = sanitizePlayerName(playerName);
      if (!sanitizedName) {
        throw new Error('Invalid player name');
      }

      // Check for profanity before submission
      if (containsProfanity(sanitizedName)) {
        throw new Error('Please choose an appropriate name');
      }

      // Submit the score
      const { error: insertError } = await supabase
        .from('leaderboard')
        .insert({ player_name: sanitizedName, score });

      if (insertError) {
        throw insertError;
      }

      // Get the player's rank
      const { count, error: countError } = await supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gt('score', score);

      if (countError) {
        console.warn('Could not fetch rank:', countError);
        return { success: true };
      }

      return { success: true, rank: (count || 0) + 1 };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit score';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [sanitizePlayerName]);

  const getPlayerRank = useCallback(async (score: number, period: TimePeriod = 'all'): Promise<number | null> => {
    try {
      const timeFilter = getTimeFilter(period);
      
      let query = supabase
        .from('leaderboard')
        .select('*', { count: 'exact', head: true })
        .gt('score', score);

      if (timeFilter) {
        query = query.gte('created_at', timeFilter.toISOString());
      }

      const { count, error: countError } = await query;

      if (countError) {
        throw countError;
      }

      return (count || 0) + 1;
    } catch (err) {
      console.error('Failed to get rank:', err);
      return null;
    }
  }, [getTimeFilter]);

  // Get stored player name from localStorage
  const getStoredPlayerName = useCallback((): string => {
    return localStorage.getItem('blockblast_player_name') || '';
  }, []);

  // Store player name in localStorage
  const storePlayerName = useCallback((name: string): void => {
    localStorage.setItem('blockblast_player_name', name);
  }, []);

  return {
    fetchLeaderboard,
    submitScore,
    getPlayerRank,
    getStoredPlayerName,
    storePlayerName,
    isLoading,
    error,
  };
}
