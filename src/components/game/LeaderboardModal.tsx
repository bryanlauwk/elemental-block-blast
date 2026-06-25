import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, X, Trash2, Globe, User, Loader2 } from 'lucide-react';
import { HighScoreEntry } from '@/hooks/useHighScores';
import { useGlobalLeaderboard, TimePeriod, LeaderboardEntry } from '@/hooks/useGlobalLeaderboard';
import { Button } from '@/components/ui/button';
import { modalStyles } from '@/game/theme';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  highScores: HighScoreEntry[];
  currentScore?: number;
  onClear?: () => void;
  highlightPlayerName?: string;
}

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  day: 'Today',
  week: 'Week',
  month: 'Month',
  all: 'All Time',
};

export function LeaderboardModal({ 
  isOpen, 
  onClose, 
  highScores, 
  currentScore, 
  onClear,
  highlightPlayerName 
}: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [globalScores, setGlobalScores] = useState<LeaderboardEntry[]>([]);
  
  const { fetchLeaderboard, isLoading, error } = useGlobalLeaderboard();

  // Fetch global leaderboard when modal opens or time period changes
  useEffect(() => {
    if (isOpen && activeTab === 'global') {
      fetchLeaderboard(timePeriod).then(setGlobalScores);
    }
  }, [isOpen, activeTab, timePeriod, fetchLeaderboard]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-[#FFD700]" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Award className="w-5 h-5 text-[#FF9F43]" />;
      default:
        return <span className="w-5 text-center text-sm text-white/50">{rank}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pixar-navy-deep/80 backdrop-blur-md z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
          >
            <div 
              className="pixar-modal-shell p-4 sm:p-5"
              style={modalStyles.container}
            >
              {/* Decorative top gradient bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: 'linear-gradient(90deg, #FF6B35 0%, #FFD700 50%, #00E5FF 100%)',
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2.5 rounded-xl"
                    style={modalStyles.headerIconGold}
                  >
                    <Trophy className="w-5 h-5 text-amber-900" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Leaderboard</h2>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab === 'local' && onClear && highScores.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-white/40 hover:text-red-400 hover:bg-red-400/10"
                      onClick={onClear}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-1 mb-4 p-1 bg-black/30 rounded-xl">
                <button
                  onClick={() => setActiveTab('global')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'global'
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                  style={activeTab === 'global' ? {
                    background: 'linear-gradient(135deg, #00B4D8 0%, #00E5FF 100%)',
                  } : undefined}
                >
                  <Globe className="w-4 h-4" />
                  Global
                </button>
                <button
                  onClick={() => setActiveTab('local')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'local'
                      ? 'text-white'
                      : 'text-white/50 hover:text-white'
                  }`}
                  style={activeTab === 'local' ? {
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F43 100%)',
                  } : undefined}
                >
                  <User className="w-4 h-4" />
                  Local
                </button>
              </div>

              {/* Time Period Filter (Global only) */}
              {activeTab === 'global' && (
                <div className="flex gap-1 mb-4">
                  {(Object.keys(TIME_PERIOD_LABELS) as TimePeriod[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => setTimePeriod(period)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        timePeriod === period
                          ? 'text-white'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                      style={timePeriod === period ? {
                        background: 'rgba(0,229,255,0.2)',
                        border: '1px solid rgba(0,229,255,0.4)',
                      } : undefined}
                    >
                      {TIME_PERIOD_LABELS[period]}
                    </button>
                  ))}
                </div>
              )}

              {/* Scores list */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {activeTab === 'global' ? (
                  // Global Leaderboard
                  isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8">
                      <p className="text-red-400 text-sm">{error}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-white/50"
                        onClick={() => fetchLeaderboard(timePeriod).then(setGlobalScores)}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : globalScores.length === 0 ? (
                    <div className="text-center py-8">
                      <Globe className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50 text-sm">No scores yet for this period</p>
                      <p className="text-white/30 text-xs mt-1">Be the first to set a record!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {globalScores.map((entry, index) => {
                        const isHighlighted = highlightPlayerName && 
                          entry.player_name.toLowerCase() === highlightPlayerName.toLowerCase();
                        
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                            style={
                              isHighlighted 
                                ? modalStyles.infoBoxCyan
                                : index === 0 
                                  ? modalStyles.infoBoxFire
                                  : { background: 'rgba(255,255,255,0.05)' }
                            }
                          >
                            <div className="w-6 flex justify-center">
                              {getRankIcon(index + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold truncate ${
                                index === 0 ? 'text-[#FFD700]' : 'text-white'
                              }`}>
                                {entry.player_name}
                              </p>
                              <p className="text-xs text-white/40">
                                {formatDate(entry.created_at)}
                              </p>
                            </div>
                            <span className={`font-bold text-lg ${
                              index === 0 ? 'text-[#FFD700]' : 'text-white'
                            }`}>
                              {entry.score.toLocaleString()}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  // Local Leaderboard
                  highScores.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50 text-sm">No local scores yet</p>
                      <p className="text-white/30 text-xs mt-1">Play a game to set a record!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {highScores.slice(0, 10).map((entry, index) => {
                        const isCurrentScore = currentScore !== undefined && entry.score === currentScore;
                        
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                            style={
                              isCurrentScore 
                                ? modalStyles.infoBoxCyan
                                : index === 0 
                                  ? modalStyles.infoBoxFire
                                  : { background: 'rgba(255,255,255,0.05)' }
                            }
                          >
                            <div className="w-6 flex justify-center">
                              {getRankIcon(index + 1)}
                            </div>
                            <span className={`flex-1 font-bold text-lg ${
                              index === 0 ? 'text-[#FFD700]' : 'text-white'
                            }`}>
                              {entry.score.toLocaleString()}
                            </span>
                            <span className="text-white/40 text-xs">
                              {entry.date}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
