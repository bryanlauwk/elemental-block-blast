import { Zap, Sparkles, Calendar, Trophy } from 'lucide-react';

const ITEMS = [
  { icon: Zap, label: 'INSERT COIN' },
  { icon: Calendar, label: 'DAILY CHALLENGE LIVE' },
  { icon: Sparkles, label: 'CHAIN REACTIONS = MEGA SCORE' },
  { icon: Trophy, label: 'CLIMB THE GLOBAL LEADERBOARD' },
  { icon: Zap, label: 'INSERT COIN' },
  { icon: Calendar, label: 'DAILY CHALLENGE LIVE' },
  { icon: Sparkles, label: 'CHAIN REACTIONS = MEGA SCORE' },
  { icon: Trophy, label: 'CLIMB THE GLOBAL LEADERBOARD' },
];

export const MarqueeRibbon = () => {
  return (
    <div
      className="relative w-full overflow-hidden border-y border-pixar-blue/30 bg-pixar-navy-deep/70 py-1.5 backdrop-blur-sm"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--pixar-navy-deep)) 0%, transparent 8%, transparent 92%, hsl(var(--pixar-navy-deep)) 100%)',
        }}
      />
      <div className="neon-marquee-track flex w-max items-center gap-10 whitespace-nowrap px-6 text-[10px] font-bold uppercase tracking-[0.35em] sm:text-xs font-display">
        {ITEMS.map(({ icon: Icon, label }, i) => (
          <span key={i} className="flex items-center gap-2 text-pixar-yellow">
            <Icon className="h-3 w-3 text-pixar-red" />
            <span className="text-white/85">{label}</span>
            <span className="text-pixar-red">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeRibbon;