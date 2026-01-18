import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Music2, X, Settings } from 'lucide-react';
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
  stopMusic 
} from '@/game/sounds';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const [sfxOn, setSfxOn] = useState(isSfxEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());
  const [volume, setVolume] = useState([getMusicVolume() * 100]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-xs mx-auto"
          >
            <div className="bg-gradient-to-b from-game-grid-dark to-game-grid-darker rounded-2xl p-5 border border-game-grid-border shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-game-accent" />
                  <h2 className="text-lg font-bold text-white">Sound Settings</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-game-text-muted hover:text-white hover:bg-white/10"
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
                      <Volume2 className="w-5 h-5 text-game-accent" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-game-text-muted" />
                    )}
                    <div>
                      <p className="text-white font-medium">Sound Effects</p>
                      <p className="text-xs text-game-text-muted">Game sounds & reactions</p>
                    </div>
                  </div>
                  <Switch
                    checked={sfxOn}
                    onCheckedChange={handleSfxToggle}
                    className="data-[state=checked]:bg-game-accent"
                  />
                </div>

                {/* Music Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {musicOn ? (
                      <Music className="w-5 h-5 text-game-accent" />
                    ) : (
                      <Music2 className="w-5 h-5 text-game-text-muted" />
                    )}
                    <div>
                      <p className="text-white font-medium">Background Music</p>
                      <p className="text-xs text-game-text-muted">Ambient soundtrack</p>
                    </div>
                  </div>
                  <Switch
                    checked={musicOn}
                    onCheckedChange={handleMusicToggle}
                    className="data-[state=checked]:bg-game-accent"
                  />
                </div>

                {/* Volume Slider */}
                <div className={`space-y-3 ${!musicOn ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-game-text-muted">Music Volume</p>
                    <span className="text-sm text-white font-medium">{Math.round(volume[0])}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Hint */}
              <p className="text-xs text-game-text-muted/60 text-center mt-5">
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
          ? 'bg-game-grid-dark/80 border-game-grid-border/50 hover:bg-game-grid-dark' 
          : 'bg-game-grid-dark/80 border-red-500/30 hover:bg-game-grid-dark'
      }`}
      title="Sound Settings"
    >
      {isAnyOn ? (
        <Volume2 className="w-5 h-5 text-game-accent" />
      ) : (
        <VolumeX className="w-5 h-5 text-red-400" />
      )}
    </button>
  );
}
