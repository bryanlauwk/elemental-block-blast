import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTodayDateString } from '@/game/seededRandom';

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

  const submitDailyScore = useCallback(async (
    playerName: string, 
    score: number,
    date: string = getTodayDateString()
  ): Promise<{ success: boolean; rank?: number; isNewBest?: boolean }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if player already has a score for today
      const { data: existing } = await supabase
        .from('daily_challenge_scores')
        .select('id, score')
        .eq('player_name', playerName.trim())
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
            player_name: playerName.trim(), 
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
  }, []);

  const getPlayerDailyScore = useCallback(async (
    playerName: string,
    date: string = getTodayDateString()
  ): Promise<number | null> => {
    try {
      const { data } = await supabase
        .from('daily_challenge_scores')
        .select('score')
        .eq('player_name', playerName.trim())
        .eq('challenge_date', date)
        .maybeSingle();

      return data?.score || null;
    } catch (err) {
      console.error('Failed to get player daily score:', err);
      return null;
    }
  }, []);

  return {
    fetchDailyLeaderboard,
    submitDailyScore,
    getPlayerDailyScore,
    isLoading,
    error,
  };
}
