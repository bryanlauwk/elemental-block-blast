import { useState, useEffect, useCallback } from 'react';

export interface HighScoreEntry {
  score: number;
  date: string;
  id: string;
}

const STORAGE_KEY = 'elemental-tetris-highscores';
const MAX_ENTRIES = 10;

export function useHighScores() {
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);

  // Load scores from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHighScores(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load high scores:', e);
    }
  }, []);

  // Save a new score
  const saveScore = useCallback((score: number): { rank: number; isHighScore: boolean } => {
    const newEntry: HighScoreEntry = {
      score,
      date: new Date().toLocaleDateString(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedScores = [...highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ENTRIES);

    const rank = updatedScores.findIndex(e => e.id === newEntry.id) + 1;
    const isHighScore = rank > 0 && rank <= MAX_ENTRIES;

    if (isHighScore) {
      setHighScores(updatedScores);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
      } catch (e) {
        console.error('Failed to save high scores:', e);
      }
    }

    return { rank: isHighScore ? rank : 0, isHighScore };
  }, [highScores]);

  // Clear all scores
  const clearScores = useCallback(() => {
    setHighScores([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear high scores:', e);
    }
  }, []);

  // Get the current high score
  const topScore = highScores.length > 0 ? highScores[0].score : 0;

  return {
    highScores,
    topScore,
    saveScore,
    clearScores,
  };
}
