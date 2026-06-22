import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Menu, Volume2, Calendar, Award, Trophy, HelpCircle, Zap, Flame,
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { PixarChip } from '@/components/game/pixar';

interface MobileMenuProps {
  onOpenSoundSettings: () => void;
  onOpenDailyChallenge: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenTutorial: () => void;
  onToggleReactionFeed?: () => void;
  showReactionFeedToggle?: boolean;
  reactionFeedActive?: boolean;
  currentStreak?: number;
  isStreakAtRisk?: boolean;
}

const menuItems = [
  { id: 'sound', label: 'Sound Settings', icon: Volume2, color: 'text-white' },
  { id: 'daily', label: 'Daily Challenge', icon: Calendar, color: 'text-pixar-yellow' },
  { id: 'achievements', label: 'Achievements', icon: Award, color: 'text-pixar-yellow' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-pixar-yellow' },
  { id: 'tutorial', label: 'How to Play', icon: HelpCircle, color: 'text-white' },
] as const;

export function MobileMenu({
  onOpenSoundSettings,
  onOpenDailyChallenge,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenTutorial,
  onToggleReactionFeed,
  showReactionFeedToggle,
  reactionFeedActive,
  currentStreak,
  isStreakAtRisk,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (id: string) => {
    setIsOpen(false);
    setTimeout(() => {
      switch (id) {
        case 'sound': onOpenSoundSettings(); break;
        case 'daily': onOpenDailyChallenge(); break;
        case 'achievements': onOpenAchievements(); break;
        case 'leaderboard': onOpenLeaderboard(); break;
        case 'tutorial': onOpenTutorial(); break;
        case 'reactions': onToggleReactionFeed?.(); break;
      }
    }, 150);
  };

  return (
    <>
      <PixarChip onClick={() => setIsOpen(true)} aria-label="Open menu">
        <Menu className="w-5 h-5 text-white" />
      </PixarChip>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="w-[280px] sm:w-[320px] border-l-pixar-blue/30 p-0 overflow-hidden"
          style={{
            background:
              'linear-gradient(180deg, hsl(var(--pixar-navy)) 0%, hsl(var(--pixar-navy-deep)) 100%)',
          }}
        >
          <SheetHeader className="p-4 pb-2 border-b border-pixar-blue/25">
            <SheetTitle className="text-white font-display tracking-wide flex items-center gap-2">
              <Flame className="w-5 h-5 text-pixar-red" />
              <span className="bg-gradient-to-r from-pixar-yellow via-white to-pixar-red bg-clip-text text-transparent">
                Menu
              </span>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col p-3 gap-1.5">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleItemClick(item.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all',
                  'bg-pixar-navy-deep/60 hover:bg-pixar-navy/70 active:scale-[0.98]',
                  'border border-pixar-blue/20 hover:border-pixar-yellow/45',
                )}
              >
                <div className="pixar-glass-chip w-10 h-10 rounded-xl flex items-center justify-center">
                  <item.icon
                    className={cn('w-5 h-5', item.color)}
                    fill={item.id === 'leaderboard' ? 'hsl(var(--pixar-yellow))' : undefined}
                  />
                </div>
                <span className="text-white font-sans font-bold text-sm tracking-wide">{item.label}</span>
              </motion.button>
            ))}

            {currentStreak && currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl',
                  'bg-gradient-to-r from-pixar-red/20 to-pixar-yellow/20',
                  'border border-pixar-yellow/40',
                )}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-pixar-red to-pixar-yellow border-b-2 border-pixar-red-deep">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white font-display tracking-wide text-lg">{currentStreak} Day Streak</span>
                  {isStreakAtRisk && (
                    <span className="text-pixar-yellow text-xs font-sans">Play today to keep it!</span>
                  )}
                </div>
              </motion.div>
            )}

            {showReactionFeedToggle && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (menuItems.length + 1) * 0.05 }}
                onClick={() => handleItemClick('reactions')}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl transition-all',
                  reactionFeedActive
                    ? 'bg-pixar-yellow/15 border border-pixar-yellow/50'
                    : 'bg-pixar-navy-deep/60 hover:bg-pixar-navy/70 border border-pixar-blue/20 hover:border-pixar-yellow/45',
                  'active:scale-[0.98]',
                )}
              >
                <div className="pixar-glass-chip w-10 h-10 rounded-xl flex items-center justify-center">
                  <Zap className={cn('w-5 h-5', reactionFeedActive ? 'text-pixar-yellow' : 'text-white')} />
                </div>
                <span className="text-white font-sans font-bold text-sm tracking-wide">
                  {reactionFeedActive ? 'Hide Reactions' : 'Show Reactions'}
                </span>
              </motion.button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}