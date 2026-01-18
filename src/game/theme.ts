// Shared design tokens for consistent styling across landing page and in-game

export const GAME_COLORS = {
  // Title gradient colors
  elemental: {
    cyan: '#00E5FF',
    indigo: '#6366F1',
    purple: '#A855F7',
    pink: '#EC4899',
  },
  blast: {
    main: '#FFFFFF',
    shadow: '#0891B2',
    glow: 'rgba(0, 212, 255, 0.5)',
  },
  
  // Element colors
  elements: {
    fire: { bg: '#FF6B35', shadow: '#9D2A04', glow: '#FF4500' },
    water: { bg: '#00B4D8', shadow: '#023E8A', glow: '#00CED1' },
    wood: { bg: '#8B5A2B', shadow: '#3D2314', glow: '#A0522D' },
    stone: { bg: '#8D8D8D', shadow: '#2D2D2D', glow: '#A9A9A9' },
    helium: { bg: '#84D98A', shadow: '#1B5E20', glow: '#90EE90' },
    acid: { bg: '#32CD32', shadow: '#228B22', glow: '#ADFF2F' },
    ash: { bg: '#696969', shadow: '#3C3C3C', glow: '#808080' },
    life: { bg: '#FFD700', shadow: '#DAA520', glow: '#FFDF00' },
  },
  
  // Block colors for decorative elements
  blocks: {
    red: { bg: '#FF4757', shadow: '#C0392B', highlight: '#FF8A80' },
    orange: { bg: '#FF9F43', shadow: '#E17055', highlight: '#FFEAA7' },
    yellow: { bg: '#FFC312', shadow: '#F79F1F', highlight: '#FFF59D' },
    green: { bg: '#2ED573', shadow: '#00B894', highlight: '#A3CB38' },
    cyan: { bg: '#00D2D3', shadow: '#00838F', highlight: '#81ECEC' },
    blue: { bg: '#54A0FF', shadow: '#2E86DE', highlight: '#A3D9FF' },
    purple: { bg: '#A55EEA', shadow: '#8854D0', highlight: '#D2B4DE' },
  },
};

// Shared shadows
export const GAME_SHADOWS = {
  block3D: (shadowColor: string) => `
    0 4px 0 ${shadowColor},
    0 6px 10px rgba(0,0,0,0.25)
  `,
  block3DLarge: (shadowColor: string) => `
    0 6px 0 ${shadowColor},
    0 8px 15px rgba(0,0,0,0.3)
  `,
  glow: (glowColor: string, intensity: number = 0.4) => `
    0 0 ${20 * intensity}px ${glowColor}
  `,
  iconButton: `
    0 4px 0 rgba(6, 182, 212, 0.3),
    0 6px 15px rgba(0,0,0,0.4),
    inset 0 1px 2px rgba(255,255,255,0.1)
  `,
  playButton: `
    0 8px 0 #047857,
    0 12px 40px rgba(16,185,129,0.5),
    inset 0 3px 8px rgba(255,255,255,0.5)
  `,
};

// Typography styles
export const GAME_TYPOGRAPHY = {
  titleFont: "'Fredoka One', 'Arial Black', sans-serif",
  bodyFont: 'system-ui, -apple-system, sans-serif',
};

// Common icon button style
export const iconButtonStyle = {
  background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.9), rgba(15, 23, 42, 0.95))',
  boxShadow: GAME_SHADOWS.iconButton,
  border: '1px solid rgba(34, 211, 238, 0.4)',
};
