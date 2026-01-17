// Placeholder audio system - logs to console for now
export type SoundType = 
  | 'sizzle' 
  | 'splash' 
  | 'crumble' 
  | 'dissolve' 
  | 'grow' 
  | 'float' 
  | 'thud' 
  | 'lineClear' 
  | 'combo' 
  | 'gameOver'
  | 'drop';

const SOUND_LABELS: Record<SoundType, string> = {
  sizzle: '🔥 Sizzle! (Fire burns)',
  splash: '💧 Splash! (Water extinguishes)',
  crumble: '🪵 Crumble! (Wood turns to ash)',
  dissolve: '🧪 Dissolve! (Acid eats through)',
  grow: '🦠 Grow! (Life spreads)',
  float: '🎈 Whoosh! (Helium floats)',
  thud: '🪨 Thud! (Stone placed)',
  lineClear: '✨ CLEAR! (Line completed)',
  combo: '💥 COMBO! (Chain reaction)',
  gameOver: '🚨 ALARM! (Lab meltdown)',
  drop: '📦 Clunk! (Piece placed)',
};

export function playSound(type: SoundType): void {
  console.log(`[SOUND] ${SOUND_LABELS[type]}`);
}
