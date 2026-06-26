import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Music2, X, Settings, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  isSfxEnabled, 
  setSfxEnabled, 
  isMusicEnabled, 
  setMusicEnabled,
  getMusicVolume,
  setMusicVolume,
  startMusic,
  stopMusic,
  getMusicType,
  setMusicType,
  getMusicTypeOptions,
  type LoFiMusicType,
} from '@/game/sounds';
import {
  isReducedMotion,
  setReducedMotionOverride,
  subscribeReducedMotion,
} from '@/game/motionPreferences';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const [sfxOn, setSfxOn] = useState(isSfxEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());
  const [volume, setVolume] = useState([getMusicVolume() * 100]);
  const [musicType, setMusicTypeState] = useState<LoFiMusicType>(getMusicType());
  const [reducedOn, setReducedOn] = useState<boolean>(() => isReducedMotion());
  const musicOptions = getMusicTypeOptions();

  useEffect(() => subscribeReducedMotion(setReducedOn), []);

  const handleSfxToggle = useCallback((checked: boolean) => {
    setSfxOn(checked);
    setSfxEnabled(checked);
  }, []);

  const handleMusicToggle = useCallback((checked: boolean) => {
    setMusicOn(checked);
    setMusicEnabled(checked);
    if (checked) {
      startMusic();
    } else {
      stopMusic();
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value);
    setMusicVolume(value[0] / 100);
  }, []);

  const handleMusicTypeChange = useCallback((type: LoFiMusicType) => {
    setMusicTypeState(type);
    setMusicType(type);
    if (!musicOn) {
      setMusicEnabled(true);
      setMusicOn(true);
      startMusic();
    }
  }, [musicOn]);

  const handleReducedToggle = useCallback((checked: boolean) => {
    setReducedOn(checked);
    setReducedMotionOverride(checked ? 'on' : 'off');
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[hsl(var(--neon-bg-deep)/0.82)] backdrop-blur-xl z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-2 z-50 mx-auto flex max-w-sm items-start justify-center sm:inset-4 sm:max-w-none sm:items-center"
          >
            <div className="neon-modal-shell neon-modal-shell--scroll w-full max-w-sm p-4 sm:p-5">
              <div className="neon-accent-bar" />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="neon-icon-chip w-10 h-10">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Sound Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Settings */}
              <div className="space-y-5">
                {/* SFX Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {sfxOn ? (
                      <Volume2 className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                      <p className="font-display text-white font-semibold tracking-wide">Sound Effects</p>
                      <p className="text-xs text-white/50">Game sounds & reactions</p>
                    </div>
                  </div>
                  <Switch
                    checked={sfxOn}
                    onCheckedChange={handleSfxToggle}
                    className="data-[state=checked]:bg-[hsl(var(--neon-cyan))]"
                  />
                </div>

                {/* Music Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {musicOn ? (
                      <Music className="w-5 h-5 text-[hsl(var(--neon-magenta))]" />
                    ) : (
                      <Music2 className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                      <p className="font-display text-white font-semibold tracking-wide">Background Music</p>
                      <p className="text-xs text-white/50">Lo-fi soundtrack</p>
                    </div>
                  </div>
                  <Switch
                    checked={musicOn}
                    onCheckedChange={handleMusicToggle}
                    className="data-[state=checked]:bg-[hsl(var(--neon-magenta))]"
                  />
                </div>

                {/* Music Type */}
                <div className={`space-y-2 ${!musicOn ? 'opacity-70' : ''}`}>
                  <p className="font-display text-xs uppercase tracking-[0.18em] text-[hsl(var(--neon-cyan)/0.85)]">Lo-fi Mood</p>
                  <div className="grid grid-cols-2 gap-2">
                    {musicOptions.map((option) => {
                      const active = musicType === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleMusicTypeChange(option.id)}
                          className={`neon-row px-3 py-2 text-left ${
                            active ? 'neon-row--cyan' : ''
                          }`}
                        >
                          <p className="font-display text-xs font-bold uppercase tracking-wide text-white">{option.label}</p>
                          <p className="mt-0.5 text-[10px] leading-snug text-white/45">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className={`space-y-3 ${!musicOn ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-xs uppercase tracking-[0.18em] text-[hsl(var(--neon-cyan)/0.85)]">Music Volume</p>
                    <span className="font-display text-sm text-white font-bold">{Math.round(volume[0])}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full [&_[role=slider]]:bg-[hsl(var(--neon-cyan))] [&_[role=slider]]:shadow-[0_0_12px_hsl(var(--neon-cyan)/0.7)] [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-[hsl(var(--neon-cyan))] [&_.bg-primary]:to-[hsl(var(--neon-magenta))]"
                  />
                </div>
              </div>

              {/* Hint */}
              <p className="text-xs text-white/30 text-center mt-5">
                Settings are saved automatically
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Quick toggle button for the header
interface SoundToggleButtonProps {
  onClick: () => void;
}

export function SoundToggleButton({ onClick }: SoundToggleButtonProps) {
  const [sfxOn, setSfxOn] = useState(isSfxEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());

  // Sync state on mount
  useEffect(() => {
    setSfxOn(isSfxEnabled());
    setMusicOn(isMusicEnabled());
  }, []);

  const isAnyOn = sfxOn || musicOn;

  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-full border transition-colors ${
        isAnyOn 
          ? 'bg-game-grid-dark/80 border-[#00E5FF]/30 hover:bg-game-grid-dark' 
          : 'bg-game-grid-dark/80 border-red-500/30 hover:bg-game-grid-dark'
      }`}
      title="Sound Settings"
    >
      {isAnyOn ? (
        <Volume2 className="w-5 h-5 text-[#00E5FF]" />
      ) : (
        <VolumeX className="w-5 h-5 text-red-400" />
      )}
    </button>
  );
}
