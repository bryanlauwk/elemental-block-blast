import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  created_at: string;
}

export interface DailyChallengeEntry {
  id: string;
  player_name: string;
  score: number;
  challenge_date: string;
  created_at: string;
}

export function useAdminLeaderboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllLeaderboardEntries = useCallback(async (
    limit: number = 100,
    offset: number = 0
  ): Promise<{ data: LeaderboardEntry[]; count: number }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError, count } = await supabase
        .from('leaderboard')
        .select('id, player_name, score, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;

      return { data: data || [], count: count || 0 };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entries';
      setError(message);
      return { data: [], count: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllDailyChallengeEntries = useCallback(async (
    limit: number = 100,
    offset: number = 0
  ): Promise<{ data: DailyChallengeEntry[]; count: number }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError, count } = await supabase
        .from('daily_challenge_scores')
        .select('id, player_name, score, challenge_date, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fetchError) throw fetchError;

      return { data: data || [], count: count || 0 };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch entries';
      setError(message);
      return { data: [], count: 0 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteLeaderboardEntry = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('leaderboard')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDailyChallengeEntry = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('daily_challenge_scores')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete entry';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchEntries = useCallback(async (
    table: 'leaderboard' | 'daily_challenge_scores',
    searchTerm: string,
    limit: number = 50
  ): Promise<LeaderboardEntry[] | DailyChallengeEntry[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const query = supabase
        .from(table)
        .select('*')
        .ilike('player_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchAllLeaderboardEntries,
    fetchAllDailyChallengeEntries,
    deleteLeaderboardEntry,
    deleteDailyChallengeEntry,
    searchEntries,
    isLoading,
    error,
  };
}
