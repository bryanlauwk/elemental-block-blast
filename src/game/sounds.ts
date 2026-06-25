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

export type LoFiMusicType = 'cozy' | 'rainy' | 'night' | 'upbeat';

import cozyTrack from '@/assets/music/cozy.mp3.asset.json';
import rainyTrack from '@/assets/music/rainy.mp3.asset.json';
import nightTrack from '@/assets/music/night.mp3.asset.json';
import upbeatTrack from '@/assets/music/upbeat.mp3.asset.json';

// Real ElevenLabs-generated lo-fi loops, one per mood.
const LOFI_TRACK_URLS: Record<LoFiMusicType, string> = {
  cozy: cozyTrack.url,
  rainy: rainyTrack.url,
  night: nightTrack.url,
  upbeat: upbeatTrack.url,
};

interface LoFiPreset {
  id: LoFiMusicType;
  label: string;
  description: string;
  bpm: number;
  chords: number[][];
  bass: number[];
  padVolume: number;
  bassVolume: number;
  kickVolume: number;
  hatVolume: number;
  vinylVolume: number;
  filterBase: number;
  filterPeak: number;
  hatSteps: number[];
  bassSteps: number[];
  waveform: OscillatorType;
}

export const LOFI_MUSIC_PRESETS: LoFiPreset[] = [
  {
    id: 'cozy',
    label: 'Cozy Study',
    description: 'Warm pads, soft bass, relaxed beat',
    bpm: 82,
    chords: [
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [130.81, 164.81, 196.0, 246.94],
      [196.0, 246.94, 293.66, 329.63],
    ],
    bass: [110.0, 87.31, 65.41, 98.0],
    padVolume: 0.055,
    bassVolume: 0.085,
    kickVolume: 0.12,
    hatVolume: 0.035,
    vinylVolume: 0.028,
    filterBase: 620,
    filterPeak: 980,
    hatSteps: [1, 3, 5, 7, 9, 11, 13, 15],
    bassSteps: [0, 3, 6, 8, 11, 14],
    waveform: 'triangle',
  },
  {
    id: 'rainy',
    label: 'Rainy Window',
    description: 'Softer beat, misty chords, more vinyl rain',
    bpm: 74,
    chords: [
      [196.0, 246.94, 293.66, 349.23],
      [164.81, 196.0, 246.94, 329.63],
      [146.83, 185.0, 220.0, 293.66],
      [174.61, 220.0, 261.63, 329.63],
    ],
    bass: [98.0, 82.41, 73.42, 87.31],
    padVolume: 0.048,
    bassVolume: 0.065,
    kickVolume: 0.075,
    hatVolume: 0.018,
    vinylVolume: 0.05,
    filterBase: 420,
    filterPeak: 720,
    hatSteps: [3, 7, 11, 15],
    bassSteps: [0, 6, 8, 14],
    waveform: 'sine',
  },
  {
    id: 'night',
    label: 'Night Drive',
    description: 'Darker bass, wider pads, late-night pulse',
    bpm: 88,
    chords: [
      [185.0, 220.0, 277.18, 329.63],
      [146.83, 185.0, 233.08, 293.66],
      [164.81, 207.65, 246.94, 311.13],
      [196.0, 246.94, 293.66, 369.99],
    ],
    bass: [92.5, 73.42, 82.41, 98.0],
    padVolume: 0.052,
    bassVolume: 0.11,
    kickVolume: 0.13,
    hatVolume: 0.026,
    vinylVolume: 0.022,
    filterBase: 520,
    filterPeak: 860,
    hatSteps: [1, 5, 7, 9, 13, 15],
    bassSteps: [0, 2, 6, 8, 10, 14],
    waveform: 'triangle',
  },
  {
    id: 'upbeat',
    label: 'Upbeat Study',
    description: 'Brighter chords, tighter groove, more movement',
    bpm: 96,
    chords: [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 277.18, 329.63, 440.0],
      [246.94, 311.13, 369.99, 493.88],
      [196.0, 246.94, 293.66, 392.0],
    ],
    bass: [130.81, 110.0, 123.47, 98.0],
    padVolume: 0.047,
    bassVolume: 0.082,
    kickVolume: 0.11,
    hatVolume: 0.04,
    vinylVolume: 0.018,
    filterBase: 760,
    filterPeak: 1240,
    hatSteps: [1, 2, 3, 5, 7, 9, 10, 11, 13, 15],
    bassSteps: [0, 3, 4, 7, 8, 11, 12, 15],
    waveform: 'triangle',
  },
];

// Singleton AudioContext
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function createTone(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume: number = 0.3,
  attack: number = 0.01,
  decay: number = 0.1,
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

function createNoise(ctx: AudioContext, duration: number, volume: number = 0.2): GainNode {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
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

function playDrop(): void {
  const ctx = getAudioContext();
  createTone(ctx, 150, 'sine', 0.15, 0.4, 0.005, 0.05);
  createTone(ctx, 80, 'sine', 0.2, 0.3, 0.01, 0.1);
}

function playLineClear(): void {
  const ctx = getAudioContext();
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
  setTimeout(() => {
    createTone(ctx, 800, 'sine', 0.1, 0.2, 0.01, 0.05);
    createTone(ctx, 1000, 'sine', 0.1, 0.15, 0.01, 0.05);
  }, 100);
}

function playCombo(): void {
  const ctx = getAudioContext();
  [523, 659, 784, 1047].forEach((freq, i) => {
    setTimeout(() => {
      createTone(ctx, freq, 'sine', 0.2, 0.35, 0.01, 0.08);
      createTone(ctx, freq * 2, 'sine', 0.15, 0.15, 0.01, 0.05);
    }, i * 60);
  });
}

function playSizzle(): void { const ctx = getAudioContext(); createNoise(ctx, 0.3, 0.15); createTone(ctx, 200, 'sawtooth', 0.2, 0.1, 0.01, 0.1); }
function playSplash(): void {
  const ctx = getAudioContext();
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
function playDissolve(): void { const ctx = getAudioContext(); for (let i = 0; i < 4; i++) setTimeout(() => createTone(ctx, 200 + Math.random() * 300, 'sine', 0.08, 0.15, 0.01, 0.03), i * 50); createNoise(ctx, 0.3, 0.1); }
function playGrow(): void {
  const ctx = getAudioContext();
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
function playFloat(): void { const ctx = getAudioContext(); createTone(ctx, 800, 'sine', 0.3, 0.15, 0.05, 0.1); createTone(ctx, 1200, 'sine', 0.25, 0.1, 0.08, 0.1); }
function playCrumble(): void { const ctx = getAudioContext(); createNoise(ctx, 0.2, 0.2); createTone(ctx, 100, 'sine', 0.15, 0.2, 0.01, 0.05); }
function playThud(): void { const ctx = getAudioContext(); createTone(ctx, 60, 'sine', 0.2, 0.4, 0.01, 0.05); createTone(ctx, 40, 'sine', 0.25, 0.3, 0.02, 0.1); }
function playGameOver(): void {
  const ctx = getAudioContext();
  [400, 350, 300, 200].forEach((freq, i) => setTimeout(() => createTone(ctx, freq, 'sine', 0.4, 0.3, 0.02, 0.2), i * 150));
  setTimeout(() => { for (let i = 0; i < 3; i++) setTimeout(() => createTone(ctx, 150, 'square', 0.1, 0.15, 0.01, 0.05), i * 150); }, 600);
}
function playSelect(): void { const ctx = getAudioContext(); createTone(ctx, 600, 'sine', 0.08, 0.2, 0.005, 0.03); createTone(ctx, 900, 'sine', 0.06, 0.1, 0.01, 0.02); }
function playHighScore(): void {
  const ctx = getAudioContext();
  [523, 659, 784, 1047, 1319].forEach((freq, i) => setTimeout(() => { createTone(ctx, freq, 'sine', 0.3, 0.35, 0.01, 0.1); createTone(ctx, freq * 1.5, 'triangle', 0.2, 0.15, 0.02, 0.08); }, i * 80));
  setTimeout(() => { for (let i = 0; i < 6; i++) setTimeout(() => createTone(ctx, 1500 + Math.random() * 1000, 'sine', 0.1, 0.1, 0.01, 0.05), i * 50); }, 400);
}

let sfxEnabled = true;
let musicEnabled = true;
let musicVolume = 0.24;
let musicType: LoFiMusicType = 'cozy';
let activePreset = LOFI_MUSIC_PRESETS[0];
let musicOscillators: OscillatorNode[] = [];
let musicSources: AudioBufferSourceNode[] = [];
let musicGainNode: GainNode | null = null;
let musicIntervals: number[] = [];
let musicPlaying = false;
let musicStep = 0;
let visibilityHandler: (() => void) | null = null;
let musicAudioEl: HTMLAudioElement | null = null;

function getPreset(id: LoFiMusicType): LoFiPreset {
  return LOFI_MUSIC_PRESETS.find((preset) => preset.id === id) ?? LOFI_MUSIC_PRESETS[0];
}

function loadSoundSettings(): void {
  try {
    const settings = localStorage.getItem('elemental-blast-sound-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      sfxEnabled = parsed.sfxEnabled ?? true;
      musicEnabled = parsed.musicEnabled ?? true;
      musicVolume = parsed.musicVolume ?? 0.24;
      musicType = parsed.musicType ?? 'cozy';
      activePreset = getPreset(musicType);
    }
  } catch (e) {}
}

function saveSoundSettings(): void {
  try {
    localStorage.setItem('elemental-blast-sound-settings', JSON.stringify({ sfxEnabled, musicEnabled, musicVolume, musicType }));
  } catch (e) {}
}

loadSoundSettings();

export function setSfxEnabled(enabled: boolean): void { sfxEnabled = enabled; saveSoundSettings(); }
export function isSfxEnabled(): boolean { return sfxEnabled; }
export function setMusicEnabled(enabled: boolean): void { musicEnabled = enabled; saveSoundSettings(); if (!enabled) stopMusic(); }
export function isMusicEnabled(): boolean { return musicEnabled; }
export function setMusicVolume(volume: number): void {
  musicVolume = Math.max(0, Math.min(1, volume));
  saveSoundSettings();
  if (musicGainNode) musicGainNode.gain.setTargetAtTime(musicVolume, getAudioContext().currentTime, 0.05);
  if (musicAudioEl) musicAudioEl.volume = Math.min(1, musicVolume * 2.6);
}
export function getMusicVolume(): number { return musicVolume; }
export function getMusicType(): LoFiMusicType { return musicType; }
export function getMusicTypeOptions(): LoFiPreset[] { return LOFI_MUSIC_PRESETS; }
export function setMusicType(type: LoFiMusicType): void {
  musicType = type;
  activePreset = getPreset(type);
  saveSoundSettings();
  if (musicPlaying) {
    stopMusic(false);
    startMusic();
  }
}
export function setSoundEnabled(enabled: boolean): void { setSfxEnabled(enabled); }
export function isSoundEnabled(): boolean { return sfxEnabled; }

function connectToMusic(node: AudioNode): void { if (musicGainNode) node.connect(musicGainNode); }

function scheduleLoFiChord(ctx: AudioContext, freqs: number[], startAt: number): void {
  const chordBus = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(activePreset.filterBase, startAt);
  filter.frequency.linearRampToValueAtTime(activePreset.filterPeak, startAt + 1.4);
  filter.Q.value = 0.55;
  chordBus.gain.setValueAtTime(0, startAt);
  chordBus.gain.linearRampToValueAtTime(activePreset.padVolume, startAt + 0.24);
  chordBus.gain.setValueAtTime(activePreset.padVolume * 0.82, startAt + 2.1);
  chordBus.gain.exponentialRampToValueAtTime(0.001, startAt + 3.15);
  filter.connect(chordBus);
  connectToMusic(chordBus);

  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    osc.type = index % 2 === 0 ? activePreset.waveform : 'sine';
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
  gain.gain.linearRampToValueAtTime(activePreset.bassVolume, startAt + 0.035);
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
  gain.gain.setValueAtTime(activePreset.kickVolume, startAt);
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
  gain.gain.linearRampToValueAtTime(activePreset.hatVolume, startAt + 0.006);
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
  gain.gain.value = activePreset.vinylVolume;
  source.connect(filter);
  filter.connect(gain);
  connectToMusic(gain);
  source.start();
  musicSources.push(source);
}

function createLoFiMusic(ctx: AudioContext): void {
  activePreset = getPreset(musicType);
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

  const beatMs = Math.round(60000 / activePreset.bpm);
  const tick = () => {
    if (!musicEnabled || !musicPlaying || document.hidden) return;
    const startAt = ctx.currentTime + 0.045;
    const step = musicStep % 16;
    const bar = Math.floor(step / 4);
    if (step % 4 === 0) scheduleLoFiChord(ctx, activePreset.chords[bar], startAt);
    if ([0, 4, 8, 12].includes(step)) scheduleLoFiKick(ctx, startAt);
    if (activePreset.bassSteps.includes(step)) scheduleLoFiBass(ctx, activePreset.bass[bar], startAt + 0.02);
    if (activePreset.hatSteps.includes(step)) scheduleLoFiHat(ctx, startAt + 0.03);
    musicStep += 1;
  };
  tick();
  musicIntervals.push(window.setInterval(tick, beatMs));
}

export function startMusic(): void {
  if (!musicEnabled || musicPlaying) return;
  try {
    musicPlaying = true;
    musicStep = 0;
    const trackUrl = LOFI_TRACK_URLS[musicType];
    if (trackUrl) {
      startTrack(trackUrl);
    } else {
      const ctx = getAudioContext();
      createLoFiMusic(ctx);
    }
    if (!visibilityHandler) {
      visibilityHandler = () => { if (document.hidden && musicPlaying) stopMusic(false); };
      document.addEventListener('visibilitychange', visibilityHandler);
    }
  } catch (error) {
    console.warn('Failed to start music:', error);
  }
}

export function stopMusic(persistSetting = true): void {
  musicPlaying = false;
  if (musicAudioEl) {
    try { musicAudioEl.pause(); musicAudioEl.src = ''; } catch (e) {}
    musicAudioEl = null;
  }
  musicOscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) {} });
  musicOscillators = [];
  musicSources.forEach(source => { try { source.stop(); source.disconnect(); } catch (e) {} });
  musicSources = [];
  if (musicGainNode) { try { musicGainNode.disconnect(); } catch (e) {} musicGainNode = null; }
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
  }
  setMusicEnabled(true);
  startMusic();
  return true;
}

export function getIsMusicPlaying(): boolean { return musicPlaying; }

export function playSound(type: SoundType): void {
  if (!sfxEnabled) return;
  try {
    switch (type) {
      case 'drop': playDrop(); break;
      case 'lineClear': playLineClear(); break;
      case 'combo': playCombo(); break;
      case 'sizzle': playSizzle(); break;
      case 'splash': playSplash(); break;
      case 'dissolve': playDissolve(); break;
      case 'grow': playGrow(); break;
      case 'float': playFloat(); break;
      case 'crumble': playCrumble(); break;
      case 'thud': playThud(); break;
      case 'gameOver': playGameOver(); break;
      case 'select': playSelect(); break;
      case 'highScore': playHighScore(); break;
    }
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
}
