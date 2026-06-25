import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Music, Music2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { modalStyles } from '@/game/theme';
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

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const [sfxOn, setSfxOn] = useState(isSfxEnabled());
  const [musicOn, setMusicOn] = useState(isMusicEnabled());
  const [volume, setVolume] = useState([getMusicVolume() * 100]);
  const [musicType, setMusicTypeState] = useState<LoFiMusicType>(getMusicType());
  const musicOptions = getMusicTypeOptions();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pixar-navy-deep/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-2 sm:inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div 
              className="pixar-modal-shell p-4 sm:p-5"
              style={modalStyles.container}
            >
              {/* Decorative top gradient bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{
                  background: 'linear-gradient(90deg, #FF6B35 0%, #FFD700 50%, #00E5FF 100%)',
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-xl"
                    style={modalStyles.headerIconCyan}
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Sound Settings</h2>
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
                      <Volume2 className="w-5 h-5 text-[#00E5FF]" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                      <p className="text-white font-medium">Sound Effects</p>
                      <p className="text-xs text-white/50">Game sounds & reactions</p>
                    </div>
                  </div>
                  <Switch
                    checked={sfxOn}
                    onCheckedChange={handleSfxToggle}
                    className="data-[state=checked]:bg-[#00E5FF]"
                  />
                </div>

                {/* Music Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {musicOn ? (
                      <Music className="w-5 h-5 text-[#FF6B35]" />
                    ) : (
                      <Music2 className="w-5 h-5 text-white/40" />
                    )}
                    <div>
                      <p className="text-white font-medium">Background Music</p>
                      <p className="text-xs text-white/50">Procedural lo-fi soundtrack</p>
                    </div>
                  </div>
                  <Switch
                    checked={musicOn}
                    onCheckedChange={handleMusicToggle}
                    className="data-[state=checked]:bg-[#FF6B35]"
                  />
                </div>

                {/* Music Type */}
                <div className={`space-y-2 ${!musicOn ? 'opacity-70' : ''}`}>
                  <p className="text-sm text-white/50">Lo-fi Mood</p>
                  <div className="grid grid-cols-2 gap-2">
                    {musicOptions.map((option) => {
                      const active = musicType === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleMusicTypeChange(option.id)}
                          className={`rounded-2xl border px-3 py-2 text-left transition-all ${
                            active
                              ? 'border-[#FFD700]/70 bg-[#FFD700]/15 shadow-[0_0_18px_rgba(255,215,0,0.16)]'
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <p className="text-xs font-bold text-white">{option.label}</p>
                          <p className="mt-0.5 text-[10px] leading-snug text-white/45">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Volume Slider */}
                <div className={`space-y-3 ${!musicOn ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/50">Music Volume</p>
                    <span className="text-sm text-white font-medium">{Math.round(volume[0])}%</span>
                  </div>
                  <Slider
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full [&_[role=slider]]:bg-[#FFD700] [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-[#FF6B35] [&_.bg-primary]:to-[#FFD700]"
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
