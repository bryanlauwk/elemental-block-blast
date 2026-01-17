import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Flame, Droplets, FlaskConical } from 'lucide-react';

interface ReactionEvent {
  id: string;
  type: 'burn' | 'extinguish' | 'dissolve';
  source: string;
  target: string;
  points: number;
  timestamp: number;
}

interface ReactionPreview {
  type: 'burn' | 'extinguish' | 'dissolve';
  count: number;
  points: number;
}

interface ReactionFeedProps {
  reactions: ReactionEvent[];
  preview: ReactionPreview | null;
  className?: string;
}

const reactionConfig = {
  burn: {
    icon: Flame,
    label: 'BURN',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    description: 'Fire burns Wood → Ash',
  },
  extinguish: {
    icon: Droplets,
    label: 'SPLASH',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    description: 'Water + Fire → Both vanish',
  },
  dissolve: {
    icon: FlaskConical,
    label: 'DISSOLVE',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30',
    description: 'Acid dissolves any element',
  },
};

const elementEmoji: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  wood: '🪵',
  acid: '🧪',
  gas: '💨',
  stone: '🪨',
  ash: 'ite',
};

const ReactionFeed: React.FC<ReactionFeedProps> = ({ reactions, preview, className = '' }) => {
  const recentReactions = reactions.slice(-5).reverse();

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 text-white/80">
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-sm font-bold tracking-wide">REACTIONS</span>
      </div>

      {/* Preview Section */}
      <AnimatePresence mode="wait">
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`p-3 rounded-lg border-2 border-dashed ${reactionConfig[preview.type].borderColor} ${reactionConfig[preview.type].bgColor}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-white/60 uppercase tracking-wider">Preview</span>
            </div>
            <div className={`flex items-center gap-2 ${reactionConfig[preview.type].color} font-bold`}>
              {React.createElement(reactionConfig[preview.type].icon, { className: 'w-4 h-4' })}
              <span>{reactionConfig[preview.type].label}</span>
              <span className="text-white/80">×{preview.count}</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              +{preview.points} points
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction History */}
      <div className="flex flex-col gap-2 min-h-[60px] max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {recentReactions.length === 0 && !preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/40 italic text-center py-4"
            >
              Place elements near each other to trigger reactions!
            </motion.div>
          )}
          {recentReactions.map((reaction) => {
            const config = reactionConfig[reaction.type];
            return (
              <motion.div
                key={reaction.id}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                className={`flex items-center gap-2 p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}
              >
                {React.createElement(config.icon, { className: `w-4 h-4 ${config.color}` })}
                <span className="text-sm text-white/90">
                  {elementEmoji[reaction.source]}→{elementEmoji[reaction.target]}
                </span>
                <span className={`text-sm font-bold ${config.color} ml-auto`}>
                  +{reaction.points}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Quick Reference */}
      <div className="border-t border-white/10 pt-3 mt-auto">
        <div className="text-xs text-white/50 mb-2">Quick Reference:</div>
        <div className="flex flex-col gap-1 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <Flame className="w-3 h-3 text-orange-400" />
            <span>🔥 → 🪵 = 💨</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>💧 + 🔥 = 💨💨</span>
          </div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3 h-3 text-green-400" />
            <span>🧪 → any = 💀</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionFeed;
