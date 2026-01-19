import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTodayDateString } from '@/game/seededRandom';
import { containsProfanity } from '@/utils/profanityFilter';
export interface DailyChallengeEntry {
  id: string;
  player_name: string;
  score: number;
  challenge_date: string;
  created_at: string;
}

export function useDailyChallenge() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyLeaderboard = useCallback(async (date: string = getTodayDateString()): Promise<DailyChallengeEntry[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('daily_challenge_scores')
        .select('id, player_name, score, challenge_date, created_at')
        .eq('challenge_date', date)
        .order('score', { ascending: false })
        .limit(20);

      if (fetchError) {
        throw fetchError;
      }

      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch daily leaderboard';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const submitDailyScore = useCallback(async (
    playerName: string, 
    score: number,
    date: string = getTodayDateString()
  ): Promise<{ success: boolean; rank?: number; isNewBest?: boolean }> => {
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
      // Check if player already has a score for today
      const { data: existing } = await supabase
        .from('daily_challenge_scores')
        .select('id, score')
        .eq('player_name', sanitizedName)
        .eq('challenge_date', date)
        .maybeSingle();

      let isNewBest = false;

      if (existing) {
        // Only update if new score is better
        if (score > existing.score) {
          const { error: updateError } = await supabase
            .from('daily_challenge_scores')
            .update({ score })
            .eq('id', existing.id);

          if (updateError) {
            throw updateError;
          }
          isNewBest = true;
        }
      } else {
        // Insert new score
        const { error: insertError } = await supabase
          .from('daily_challenge_scores')
          .insert({ 
            player_name: sanitizedName, 
            score,
            challenge_date: date 
          });

        if (insertError) {
          throw insertError;
        }
        isNewBest = true;
      }

      // Get the player's rank
      const { count, error: countError } = await supabase
        .from('daily_challenge_scores')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_date', date)
        .gt('score', score);

      if (countError) {
        console.warn('Could not fetch rank:', countError);
        return { success: true, isNewBest };
      }

      return { success: true, rank: (count || 0) + 1, isNewBest };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit daily score';
      setError(message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [sanitizePlayerName]);

  const getPlayerDailyScore = useCallback(async (
    playerName: string,
    date: string = getTodayDateString()
  ): Promise<number | null> => {
    try {
      const sanitizedName = sanitizePlayerName(playerName);
      if (!sanitizedName) return null;

      const { data } = await supabase
        .from('daily_challenge_scores')
        .select('score')
        .eq('player_name', sanitizedName)
        .eq('challenge_date', date)
        .maybeSingle();

      return data?.score || null;
    } catch (err) {
      console.error('Failed to get player daily score:', err);
      return null;
    }
  }, [sanitizePlayerName]);

  return {
    fetchDailyLeaderboard,
    submitDailyScore,
    getPlayerDailyScore,
    isLoading,
    error,
  };
}
