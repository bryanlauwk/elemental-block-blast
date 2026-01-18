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
let musicVolume = 0.3;

// Load settings from localStorage
function loadSoundSettings(): void {
  try {
    const settings = localStorage.getItem('elemental-blast-sound-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      sfxEnabled = parsed.sfxEnabled ?? true;
      musicEnabled = parsed.musicEnabled ?? true;
      musicVolume = parsed.musicVolume ?? 0.3;
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
    musicGainNode.gain.value = musicVolume;
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

// Background music system
let musicOscillators: OscillatorNode[] = [];
let musicGainNode: GainNode | null = null;
let musicIntervalId: number | null = null;
let musicPlaying = false;

// Ambient music generator - creates a relaxing, procedural ambient soundtrack
function createAmbientMusic(ctx: AudioContext): void {
  // Master gain for music
  musicGainNode = ctx.createGain();
  musicGainNode.gain.value = musicVolume;
  musicGainNode.connect(ctx.destination);

  // Low drone
  const droneOsc = ctx.createOscillator();
  const droneGain = ctx.createGain();
  droneOsc.type = 'sine';
  droneOsc.frequency.value = 55; // Low A
  droneGain.gain.value = 0.15;
  droneOsc.connect(droneGain);
  droneGain.connect(musicGainNode);
  droneOsc.start();
  musicOscillators.push(droneOsc);

  // Second drone (fifth)
  const droneOsc2 = ctx.createOscillator();
  const droneGain2 = ctx.createGain();
  droneOsc2.type = 'sine';
  droneOsc2.frequency.value = 82.5; // E above
  droneGain2.gain.value = 0.08;
  droneOsc2.connect(droneGain2);
  droneGain2.connect(musicGainNode);
  droneOsc2.start();
  musicOscillators.push(droneOsc2);

  // Pad oscillator with slow LFO
  const padOsc = ctx.createOscillator();
  const padGain = ctx.createGain();
  const padFilter = ctx.createBiquadFilter();
  padOsc.type = 'triangle';
  padOsc.frequency.value = 220;
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 800;
  padGain.gain.value = 0.06;
  padOsc.connect(padFilter);
  padFilter.connect(padGain);
  padGain.connect(musicGainNode);
  padOsc.start();
  musicOscillators.push(padOsc);

  // Slowly modulate pad frequency for movement
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.05; // Very slow
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(padOsc.frequency);
  lfo.start();
  musicOscillators.push(lfo);

  // Occasional high sparkle notes
  const sparkleNotes = [440, 523, 659, 784, 880, 1047];
  
  musicIntervalId = window.setInterval(() => {
    if (!musicEnabled || !musicPlaying) return;
    
    // Random chance to play a sparkle
    if (Math.random() < 0.3) {
      const sparkleOsc = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      
      sparkleOsc.type = 'sine';
      sparkleOsc.frequency.value = sparkleNotes[Math.floor(Math.random() * sparkleNotes.length)];
      
      sparkleGain.gain.value = 0;
      sparkleOsc.connect(sparkleGain);
      sparkleGain.connect(musicGainNode!);
      
      const now = ctx.currentTime;
      sparkleGain.gain.setValueAtTime(0, now);
      sparkleGain.gain.linearRampToValueAtTime(0.04, now + 0.1);
      sparkleGain.gain.linearRampToValueAtTime(0, now + 2);
      
      sparkleOsc.start(now);
      sparkleOsc.stop(now + 2);
    }
  }, 3000);
}

export function startMusic(): void {
  if (!musicEnabled || musicPlaying) return;
  
  try {
    const ctx = getAudioContext();
    musicPlaying = true;
    createAmbientMusic(ctx);
  } catch (error) {
    console.warn('Failed to start music:', error);
  }
}

export function stopMusic(): void {
  musicPlaying = false;
  
  // Stop all oscillators
  musicOscillators.forEach(osc => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // Ignore
    }
  });
  musicOscillators = [];
  
  // Disconnect gain node
  if (musicGainNode) {
    musicGainNode.disconnect();
    musicGainNode = null;
  }
  
  // Clear interval
  if (musicIntervalId) {
    clearInterval(musicIntervalId);
    musicIntervalId = null;
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
