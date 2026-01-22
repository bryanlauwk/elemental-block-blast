import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, Volume2, Calendar, Award, Trophy, HelpCircle, Zap, X,
  Flame
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

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
  { id: 'daily', label: 'Daily Challenge', icon: Calendar, color: 'text-amber-400' },
  { id: 'achievements', label: 'Achievements', icon: Award, color: 'text-amber-400' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: 'text-yellow-400' },
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
    // Small delay to allow sheet to close smoothly
    setTimeout(() => {
      switch (id) {
        case 'sound':
          onOpenSoundSettings();
          break;
        case 'daily':
          onOpenDailyChallenge();
          break;
        case 'achievements':
          onOpenAchievements();
          break;
        case 'leaderboard':
          onOpenLeaderboard();
          break;
        case 'tutorial':
          onOpenTutorial();
          break;
        case 'reactions':
          onToggleReactionFeed?.();
          break;
      }
    }, 150);
  };

  const iconButtonStyle = {
    background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.9), rgba(15, 23, 42, 0.95))',
    boxShadow: '0 4px 0 rgba(6, 182, 212, 0.3), 0 6px 15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
    border: '1px solid rgba(34, 211, 238, 0.4)',
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={iconButtonStyle}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Sheet menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="right" 
          className="w-[280px] sm:w-[320px] border-l-game-grid-border/50 p-0 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, hsl(220 55% 12%) 0%, hsl(225 60% 8%) 100%)',
          }}
        >
          <SheetHeader className="p-4 pb-2 border-b border-game-grid-border/30">
            <SheetTitle className="text-white font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
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
                  'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all',
                  'bg-game-cell/50 hover:bg-game-cell-hover active:scale-[0.98]',
                  'border border-transparent hover:border-game-grid-border/30'
                )}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.6), rgba(15, 23, 42, 0.8))',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
                  }}
                >
                  <item.icon className={cn('w-5 h-5', item.color)} fill={item.id === 'leaderboard' ? '#FBBF24' : undefined} />
                </div>
                <span className="text-white font-medium text-sm">{item.label}</span>
              </motion.button>
            ))}

            {/* Streak badge if active */}
            {currentStreak && currentStreak > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: menuItems.length * 0.05 }}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl',
                  'bg-gradient-to-r from-orange-500/20 to-amber-500/20',
                  'border border-orange-500/30'
                )}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500"
                >
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-white font-bold text-lg">{currentStreak} Day Streak</span>
                  {isStreakAtRisk && (
                    <span className="text-orange-400 text-xs">Play today to keep it!</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Reaction feed toggle during gameplay */}
            {showReactionFeedToggle && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (menuItems.length + 1) * 0.05 }}
                onClick={() => handleItemClick('reactions')}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all',
                  reactionFeedActive 
                    ? 'bg-game-accent/20 border border-game-accent/40' 
                    : 'bg-game-cell/50 hover:bg-game-cell-hover border border-transparent hover:border-game-grid-border/30',
                  'active:scale-[0.98]'
                )}
              >
                <div 
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    reactionFeedActive ? 'bg-game-accent/30' : ''
                  )}
                  style={!reactionFeedActive ? {
                    background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.6), rgba(15, 23, 42, 0.8))',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
                  } : undefined}
                >
                  <Zap className={cn('w-5 h-5', reactionFeedActive ? 'text-game-accent' : 'text-yellow-400')} />
                </div>
                <span className="text-white font-medium text-sm">
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
