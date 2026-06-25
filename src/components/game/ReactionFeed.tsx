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
      <div className="flex items-center gap-2 text-white/85">
        <Zap className="w-4 h-4 text-cyan-300 drop-shadow-[0_0_6px_hsl(190_95%_60%/0.7)]" />
        <span className="font-display text-sm font-bold uppercase tracking-[0.22em] bg-clip-text text-transparent bg-[linear-gradient(90deg,#e6faff,#ffd6f5)]">
          Reactions
        </span>
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
              <span className="font-display text-[10px] text-cyan-200/80 uppercase tracking-[0.25em]">Preview</span>
            </div>
            <div className={`flex items-center gap-2 ${reactionConfig[preview.type].color} font-bold`}>
              {React.createElement(reactionConfig[preview.type].icon, { className: 'w-4 h-4' })}
              <span className="font-display uppercase tracking-wider">{reactionConfig[preview.type].label}</span>
              <span className="text-white/80 font-sans">×{preview.count}</span>
            </div>
            <div className="text-xs text-white/60 mt-1 font-sans">
              +{preview.points} points
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction History */}
      <div className="flex flex-col gap-2 min-h-[60px] max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <AnimatePresence mode="sync">
          {recentReactions.length === 0 && !preview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/45 italic text-center py-4 font-sans"
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
                <span className="text-sm text-white/90 font-sans">
                  {elementEmoji[reaction.source]}→{elementEmoji[reaction.target]}
                </span>
                <span className={`text-sm font-bold font-display ${config.color} ml-auto`}>
                  +{reaction.points}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Quick Reference */}
      <div className="border-t border-cyan-300/15 pt-3 mt-auto">
        <div className="font-display text-[10px] text-cyan-200/70 mb-2 uppercase tracking-[0.25em]">Quick Reference</div>
        <div className="flex flex-col gap-1 text-xs text-white/65 font-sans">
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
