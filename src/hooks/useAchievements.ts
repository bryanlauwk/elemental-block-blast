import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

interface AchievementState {
  achievements: Achievement[];
  totalPoints: number;
  justUnlocked: Achievement | null;
}

const ACHIEVEMENTS_KEY = 'elemental-blast-achievements';

// Define all achievements
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_reaction',
    name: 'Alchemist',
    description: 'Trigger your first elemental reaction',
    icon: '⚗️',
    points: 50,
  },
  {
    id: 'pyromancer',
    name: 'Pyromancer',
    description: 'Burn 10 wood blocks in one game',
    icon: '🔥',
    points: 100,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'flood_control',
    name: 'Flood Control',
    description: 'Extinguish 10 fires total',
    icon: '💧',
    points: 100,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'chain_reaction',
    name: 'Chain Reaction',
    description: 'Get a 3+ combo',
    icon: '⚡',
    points: 150,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Clear 3 or more lines in one move',
    icon: '✨',
    points: 200,
  },
  {
    id: 'score_1000',
    name: 'Getting Started',
    description: 'Score 1,000 points',
    icon: '🎯',
    points: 50,
  },
  {
    id: 'score_5000',
    name: 'Rising Star',
    description: 'Score 5,000 points',
    icon: '⭐',
    points: 150,
  },
  {
    id: 'score_10000',
    name: 'Master Blaster',
    description: 'Score 10,000 points',
    icon: '🏆',
    points: 300,
  },
  {
    id: 'daily_warrior',
    name: 'Daily Warrior',
    description: 'Complete 7 daily challenges',
    icon: '📅',
    points: 500,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    points: 100,
  },
  {
    id: 'streak_7',
    name: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    points: 500,
  },
  {
    id: 'acid_master',
    name: 'Acid Master',
    description: 'Dissolve 20 blocks total',
    icon: '🧪',
    points: 150,
    progress: 0,
    maxProgress: 20,
  },
];

export function useAchievements() {
  const [state, setState] = useState<AchievementState>({
    achievements: ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, unlocked: false })),
    totalPoints: 0,
    justUnlocked: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with definitions to handle new achievements
        const mergedAchievements = ACHIEVEMENT_DEFINITIONS.map(def => {
          const saved = parsed.achievements?.find((a: Achievement) => a.id === def.id);
          return saved ? { ...def, ...saved } : { ...def, unlocked: false };
        });
        
        const totalPoints = mergedAchievements
          .filter((a: Achievement) => a.unlocked)
          .reduce((sum: number, a: Achievement) => sum + a.points, 0);
        
        setState({
          achievements: mergedAchievements,
          totalPoints,
          justUnlocked: null,
        });
      } catch {
        // Keep defaults
      }
    }
  }, []);

  // Save to localStorage when achievements change
  const saveAchievements = useCallback((achievements: Achievement[]) => {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify({ achievements }));
  }, []);

  // Unlock an achievement
  const unlockAchievement = useCallback((id: string) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === id);
      if (!achievement || achievement.unlocked) return prev;

      const updated = prev.achievements.map(a => 
        a.id === id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a
      );
      
      saveAchievements(updated);
      
      return {
        achievements: updated,
        totalPoints: prev.totalPoints + achievement.points,
        justUnlocked: { ...achievement, unlocked: true, unlockedAt: Date.now() },
      };
    });
  }, [saveAchievements]);

  // Update progress on an achievement
  const updateProgress = useCallback((id: string, increment: number = 1) => {
    setState(prev => {
      const achievement = prev.achievements.find(a => a.id === id);
      if (!achievement || achievement.unlocked || achievement.maxProgress === undefined) return prev;

      const newProgress = (achievement.progress || 0) + increment;
      const shouldUnlock = newProgress >= achievement.maxProgress;

      const updated = prev.achievements.map(a => 
        a.id === id 
          ? { 
              ...a, 
              progress: newProgress,
              unlocked: shouldUnlock,
              unlockedAt: shouldUnlock ? Date.now() : undefined,
            } 
          : a
      );
      
      saveAchievements(updated);
      
      return {
        achievements: updated,
        totalPoints: shouldUnlock ? prev.totalPoints + achievement.points : prev.totalPoints,
        justUnlocked: shouldUnlock ? { ...achievement, unlocked: true, progress: newProgress, unlockedAt: Date.now() } : prev.justUnlocked,
      };
    });
  }, [saveAchievements]);

  // Clear the just unlocked notification
  const clearJustUnlocked = useCallback(() => {
    setState(prev => ({ ...prev, justUnlocked: null }));
  }, []);

  // Check various conditions and unlock achievements
  const checkAchievements = useCallback((data: {
    score?: number;
    combo?: number;
    linesCleared?: number;
    reactionType?: 'burn' | 'extinguish' | 'dissolve';
    reactionCount?: number;
    streak?: number;
    dailyChallengesCompleted?: number;
  }) => {
    const { score, combo, linesCleared, reactionType, reactionCount, streak, dailyChallengesCompleted } = data;

    // Score achievements
    if (score !== undefined) {
      if (score >= 1000) unlockAchievement('score_1000');
      if (score >= 5000) unlockAchievement('score_5000');
      if (score >= 10000) unlockAchievement('score_10000');
    }

    // Combo achievements
    if (combo !== undefined && combo >= 3) {
      unlockAchievement('chain_reaction');
    }

    // Lines cleared achievements
    if (linesCleared !== undefined && linesCleared >= 3) {
      unlockAchievement('perfectionist');
    }

    // Reaction achievements
    if (reactionType && reactionCount) {
      unlockAchievement('first_reaction');
      
      if (reactionType === 'burn') {
        updateProgress('pyromancer', reactionCount);
      } else if (reactionType === 'extinguish') {
        updateProgress('flood_control', reactionCount);
      } else if (reactionType === 'dissolve') {
        updateProgress('acid_master', reactionCount);
      }
    }

    // Streak achievements
    if (streak !== undefined) {
      if (streak >= 3) unlockAchievement('streak_3');
      if (streak >= 7) unlockAchievement('streak_7');
    }

    // Daily challenge achievements
    if (dailyChallengesCompleted !== undefined) {
      updateProgress('daily_warrior', 1);
    }
  }, [unlockAchievement, updateProgress]);

  return {
    achievements: state.achievements,
    totalPoints: state.totalPoints,
    justUnlocked: state.justUnlocked,
    unlockAchievement,
    updateProgress,
    checkAchievements,
    clearJustUnlocked,
  };
}
