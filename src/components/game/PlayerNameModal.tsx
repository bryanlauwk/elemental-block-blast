import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, User, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validatePlayerName } from '@/utils/profanityFilter';

interface PlayerNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (playerName: string) => Promise<void>;
  score: number;
  defaultName?: string;
  isSubmitting?: boolean;
}

export function PlayerNameModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  score, 
  defaultName = '',
  isSubmitting = false 
}: PlayerNameModalProps) {
  const [playerName, setPlayerName] = useState(defaultName);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && defaultName) {
      setPlayerName(defaultName);
    }
  }, [isOpen, defaultName]);

  // Sanitize player name: allow only alphanumeric, spaces, underscores, hyphens
  const sanitizePlayerName = useCallback((name: string): string => {
    // Remove any HTML-like characters and control characters for XSS defense-in-depth
    return name
      .replace(/[<>'"&\\]/g, '') // Remove HTML-sensitive characters
      .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
      .trim();
  }, []);

  const validateName = useCallback((name: string): boolean => {
    const validation = validatePlayerName(name);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid name');
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    const sanitized = sanitizePlayerName(playerName);
    if (!validateName(sanitized)) return;
    
    await onSubmit(sanitized);
  }, [playerName, sanitizePlayerName, validateName, onSubmit, isSubmitting]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit();
    }
  }, [handleSubmit, isSubmitting]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="bg-gradient-to-b from-game-grid-dark to-game-grid-darker rounded-2xl p-6 border border-game-grid-border shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-game-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                >
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-1">Submit Your Score!</h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-game-accent"
                >
                  {score.toLocaleString()} pts
                </motion.p>
              </div>

              {/* Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-game-text-muted mb-2">
                    <User className="w-4 h-4 inline-block mr-1" />
                    Enter your name
                  </label>
                  <Input
                    type="text"
                    value={playerName}
                    onChange={(e) => {
                      setPlayerName(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Your name"
                    maxLength={20}
                    className="w-full bg-game-grid-darker/50 border-game-grid-border text-white placeholder:text-game-text-muted/50 focus:border-game-accent focus:ring-game-accent"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1"
                    >
                      {error}
                    </motion.p>
                  )}
                  <p className="text-game-text-muted/60 text-xs mt-1">
                    {playerName.length}/20 characters
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || playerName.trim().length === 0}
                  className="w-full bg-gradient-to-r from-game-accent to-game-accent-hover hover:from-game-accent-hover hover:to-game-accent text-white font-bold py-3 rounded-xl shadow-lg shadow-game-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Submit to Leaderboard
                    </>
                  )}
                </Button>

                <button
                  onClick={onClose}
                  className="w-full text-game-text-muted hover:text-white text-sm py-2 transition-colors"
                  disabled={isSubmitting}
                >
                  Skip
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
