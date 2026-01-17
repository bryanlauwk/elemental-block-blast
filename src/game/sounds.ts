// Web Audio API sound system for Elemental Blast

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
  | 'drop'
  | 'select'
  | 'highScore';

// Singleton AudioContext
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Create an oscillator with envelope
function createTone(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3,
  attack: number = 0.01,
  decay: number = 0.1
): { oscillator: OscillatorNode; gainNode: GainNode } {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + attack);
  gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + attack + decay);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
  
  return { oscillator, gainNode };
}

// Create noise for effects
function createNoise(ctx: AudioContext, duration: number, volume: number = 0.2): GainNode {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const gainNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(volume, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  noise.start(now);
  noise.stop(now + duration);
  
  return gainNode;
}

// Sound effect implementations
function playDrop(): void {
  const ctx = getAudioContext();
  // Satisfying "thunk" sound
  createTone(ctx, 150, 'sine', 0.15, 0.4, 0.005, 0.05);
  createTone(ctx, 80, 'sine', 0.2, 0.3, 0.01, 0.1);
}

function playLineClear(): void {
  const ctx = getAudioContext();
  // Rising sweep with sparkle
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  
  osc.start(now);
  osc.stop(now + 0.4);
  
  // Add sparkle tones
  setTimeout(() => {
    createTone(ctx, 800, 'sine', 0.1, 0.2, 0.01, 0.05);
    createTone(ctx, 1000, 'sine', 0.1, 0.15, 0.01, 0.05);
  }, 100);
}

function playCombo(): void {
  const ctx = getAudioContext();
  // Exciting rising arpeggio
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createTone(ctx, freq, 'sine', 0.2, 0.35, 0.01, 0.08);
      createTone(ctx, freq * 2, 'sine', 0.15, 0.15, 0.01, 0.05);
    }, i * 60);
  });
}

function playSizzle(): void {
  const ctx = getAudioContext();
  // Fire crackling sound
  createNoise(ctx, 0.3, 0.15);
  createTone(ctx, 200, 'sawtooth', 0.2, 0.1, 0.01, 0.1);
}

function playSplash(): void {
  const ctx = getAudioContext();
  // Water splash
  createNoise(ctx, 0.25, 0.2);
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
  
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  
  osc.start(now);
  osc.stop(now + 0.25);
}

function playDissolve(): void {
  const ctx = getAudioContext();
  // Acidic bubbling
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      const freq = 200 + Math.random() * 300;
      createTone(ctx, freq, 'sine', 0.08, 0.15, 0.01, 0.03);
    }, i * 50);
  }
  createNoise(ctx, 0.3, 0.1);
}

function playGrow(): void {
  const ctx = getAudioContext();
  // Organic growing sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);
  
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  
  osc.start(now);
  osc.stop(now + 0.35);
}

function playFloat(): void {
  const ctx = getAudioContext();
  // Airy floating sound
  createTone(ctx, 800, 'sine', 0.3, 0.15, 0.05, 0.1);
  createTone(ctx, 1200, 'sine', 0.25, 0.1, 0.08, 0.1);
}

function playCrumble(): void {
  const ctx = getAudioContext();
  // Crumbling debris
  createNoise(ctx, 0.2, 0.2);
  createTone(ctx, 100, 'sine', 0.15, 0.2, 0.01, 0.05);
}

function playThud(): void {
  const ctx = getAudioContext();
  // Heavy impact
  createTone(ctx, 60, 'sine', 0.2, 0.4, 0.01, 0.05);
  createTone(ctx, 40, 'sine', 0.25, 0.3, 0.02, 0.1);
}

function playGameOver(): void {
  const ctx = getAudioContext();
  // Descending sad tones
  const notes = [400, 350, 300, 200];
  
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createTone(ctx, freq, 'sine', 0.4, 0.3, 0.02, 0.2);
    }, i * 150);
  });
  
  // Add alarm-like pulse
  setTimeout(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        createTone(ctx, 150, 'square', 0.1, 0.15, 0.01, 0.05);
      }, i * 150);
    }
  }, 600);
}

function playSelect(): void {
  const ctx = getAudioContext();
  // Quick blip for piece selection
  createTone(ctx, 600, 'sine', 0.08, 0.2, 0.005, 0.03);
  createTone(ctx, 900, 'sine', 0.06, 0.1, 0.01, 0.02);
}

function playHighScore(): void {
  const ctx = getAudioContext();
  // Celebratory fanfare
  const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
  
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createTone(ctx, freq, 'sine', 0.3, 0.35, 0.01, 0.1);
      createTone(ctx, freq * 1.5, 'triangle', 0.2, 0.15, 0.02, 0.08);
    }, i * 80);
  });
  
  // Add sparkle effect
  setTimeout(() => {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const freq = 1500 + Math.random() * 1000;
        createTone(ctx, freq, 'sine', 0.1, 0.1, 0.01, 0.05);
      }, i * 50);
    }
  }, 400);
}

// Sound enabled state
let soundEnabled = true;

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function playSound(type: SoundType): void {
  if (!soundEnabled) return;
  
  try {
    switch (type) {
      case 'drop':
        playDrop();
        break;
      case 'lineClear':
        playLineClear();
        break;
      case 'combo':
        playCombo();
        break;
      case 'sizzle':
        playSizzle();
        break;
      case 'splash':
        playSplash();
        break;
      case 'dissolve':
        playDissolve();
        break;
      case 'grow':
        playGrow();
        break;
      case 'float':
        playFloat();
        break;
      case 'crumble':
        playCrumble();
        break;
      case 'thud':
        playThud();
        break;
      case 'gameOver':
        playGameOver();
        break;
      case 'select':
        playSelect();
        break;
      case 'highScore':
        playHighScore();
        break;
    }
  } catch (error) {
    // Silently fail if audio context not available
    console.warn('Audio playback failed:', error);
  }
}
