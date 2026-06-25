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

// Sound settings state
let sfxEnabled = true;
let musicEnabled = true;
let musicVolume = 0.24;

// Background music system
let musicOscillators: OscillatorNode[] = [];
let musicSources: AudioBufferSourceNode[] = [];
let musicGainNode: GainNode | null = null;
let musicIntervals: number[] = [];
let musicPlaying = false;
let musicStep = 0;
let visibilityHandler: (() => void) | null = null;

// Load settings from localStorage
function loadSoundSettings(): void {
  try {
    const settings = localStorage.getItem('elemental-blast-sound-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      sfxEnabled = parsed.sfxEnabled ?? true;
      musicEnabled = parsed.musicEnabled ?? true;
      musicVolume = parsed.musicVolume ?? 0.24;
    }
  } catch (e) {
    // Ignore errors, use defaults
  }
}

// Save settings to localStorage
function saveSoundSettings(): void {
  try {
    localStorage.setItem('elemental-blast-sound-settings', JSON.stringify({
      sfxEnabled,
      musicEnabled,
      musicVolume,
    }));
  } catch (e) {
    // Ignore errors
  }
}

// Initialize settings
loadSoundSettings();

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
  saveSoundSettings();
}

export function isSfxEnabled(): boolean {
  return sfxEnabled;
}

export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
  saveSoundSettings();
  if (!enabled) {
    stopMusic();
  }
}

export function isMusicEnabled(): boolean {
  return musicEnabled;
}

export function setMusicVolume(volume: number): void {
  musicVolume = Math.max(0, Math.min(1, volume));
  saveSoundSettings();
  if (musicGainNode) {
    musicGainNode.gain.setTargetAtTime(musicVolume, getAudioContext().currentTime, 0.05);
  }
}

export function getMusicVolume(): number {
  return musicVolume;
}

// Legacy compatibility
export function setSoundEnabled(enabled: boolean): void {
  setSfxEnabled(enabled);
}

export function isSoundEnabled(): boolean {
  return sfxEnabled;
}

const BEAT_MS = 732; // 82 BPM, relaxed lo-fi puzzle tempo
const CHORDS = [
  [220.0, 261.63, 329.63, 392.0],     // Am7
  [174.61, 220.0, 261.63, 329.63],    // Fmaj7
  [130.81, 164.81, 196.0, 246.94],    // Cmaj7
  [196.0, 246.94, 293.66, 329.63],    // G6
];
const BASS = [110.0, 87.31, 65.41, 98.0];

function connectToMusic(node: AudioNode): void {
  if (musicGainNode) node.connect(musicGainNode);
}

function scheduleLoFiChord(ctx: AudioContext, freqs: number[], startAt: number): void {
  const chordBus = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(620, startAt);
  filter.frequency.linearRampToValueAtTime(980, startAt + 1.4);
  filter.Q.value = 0.55;
  chordBus.gain.setValueAtTime(0, startAt);
  chordBus.gain.linearRampToValueAtTime(0.055, startAt + 0.24);
  chordBus.gain.setValueAtTime(0.045, startAt + 2.1);
  chordBus.gain.exponentialRampToValueAtTime(0.001, startAt + 3.15);
  filter.connect(chordBus);
  connectToMusic(chordBus);

  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = index % 2 === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    osc.detune.setValueAtTime(index % 2 === 0 ? -7 : 6, startAt);
    osc.connect(filter);
    osc.start(startAt);
    osc.stop(startAt + 3.2);
    musicOscillators.push(osc);
  });
}

function scheduleLoFiBass(ctx: AudioContext, freq: number, startAt: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startAt);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.96, startAt + 0.36);
  filter.type = 'lowpass';
  filter.frequency.value = 260;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.085, startAt + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.62);
  osc.connect(filter);
  filter.connect(gain);
  connectToMusic(gain);
  osc.start(startAt);
  osc.stop(startAt + 0.68);
  musicOscillators.push(osc);
}

function scheduleLoFiKick(ctx: AudioContext, startAt: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(95, startAt);
  osc.frequency.exponentialRampToValueAtTime(42, startAt + 0.18);
  gain.gain.setValueAtTime(0.12, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.22);
  osc.connect(gain);
  connectToMusic(gain);
  osc.start(startAt);
  osc.stop(startAt + 0.24);
  musicOscillators.push(osc);
}

function scheduleLoFiHat(ctx: AudioContext, startAt: number): void {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = 'highpass';
  filter.frequency.value = 5200;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.035, startAt + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.05);
  source.connect(filter);
  filter.connect(gain);
  connectToMusic(gain);
  source.start(startAt);
  source.stop(startAt + 0.055);
  musicSources.push(source);
}

function createVinylBed(ctx: AudioContext): void {
  const duration = 2;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const dust = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.55 : 0;
    data[i] = (Math.random() * 2 - 1) * 0.035 + dust;
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.loop = true;
  filter.type = 'bandpass';
  filter.frequency.value = 1600;
  filter.Q.value = 0.35;
  gain.gain.value = 0.028;
  source.connect(filter);
  filter.connect(gain);
  connectToMusic(gain);
  source.start();
  musicSources.push(source);
}

function createLoFiMusic(ctx: AudioContext): void {
  musicGainNode = ctx.createGain();
  musicGainNode.gain.value = 0;

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -28;
  compressor.knee.value = 20;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.03;
  compressor.release.value = 0.22;

  musicGainNode.connect(compressor);
  compressor.connect(ctx.destination);
  musicGainNode.gain.setTargetAtTime(musicVolume, ctx.currentTime, 0.9);

  createVinylBed(ctx);

  const tick = () => {
    if (!musicEnabled || !musicPlaying || document.hidden) return;

    const startAt = ctx.currentTime + 0.045;
    const step = musicStep % 16;
    const bar = Math.floor(step / 4);

    if (step % 4 === 0) scheduleLoFiChord(ctx, CHORDS[bar], startAt);
    if ([0, 4, 8, 12].includes(step)) scheduleLoFiKick(ctx, startAt);
    if ([0, 3, 6, 8, 11, 14].includes(step)) scheduleLoFiBass(ctx, BASS[bar], startAt + 0.02);
    if (step % 2 === 1) scheduleLoFiHat(ctx, startAt + 0.03);

    musicStep += 1;
  };

  tick();
  musicIntervals.push(window.setInterval(tick, BEAT_MS));
}

export function startMusic(): void {
  if (!musicEnabled || musicPlaying) return;
  
  try {
    const ctx = getAudioContext();
    musicPlaying = true;
    musicStep = 0;
    createLoFiMusic(ctx);

    if (!visibilityHandler) {
      visibilityHandler = () => {
        if (document.hidden && musicPlaying) stopMusic(false);
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  } catch (error) {
    console.warn('Failed to start music:', error);
  }
}

export function stopMusic(persistSetting = true): void {
  musicPlaying = false;
  
  musicOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // Ignore
    }
  });
  musicOscillators = [];

  musicSources.forEach(source => {
    try {
      source.stop();
      source.disconnect();
    } catch (e) {
      // Ignore
    }
  });
  musicSources = [];
  
  if (musicGainNode) {
    try {
      musicGainNode.disconnect();
    } catch (e) {
      // Ignore
    }
    musicGainNode = null;
  }
  
  musicIntervals.forEach(id => clearInterval(id));
  musicIntervals = [];

  if (visibilityHandler && persistSetting) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }
}

export function toggleMusic(): boolean {
  if (musicPlaying) {
    stopMusic();
    setMusicEnabled(false);
    return false;
  } else {
    setMusicEnabled(true);
    startMusic();
    return true;
  }
}

export function getIsMusicPlaying(): boolean {
  return musicPlaying;
}

export function playSound(type: SoundType): void {
  if (!sfxEnabled) return;
  
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
