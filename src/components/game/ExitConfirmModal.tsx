import { motion, AnimatePresence } from 'framer-motion';
import { Home, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentScore: number;
}

export function ExitConfirmModal({ isOpen, onClose, onConfirm, currentScore }: ExitConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-pixar-navy-deep/60 backdrop-blur-2xl backdrop-saturate-150 p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="pixar-modal-shell w-full max-w-sm p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-white text-center mb-2">
              Quit Game?
            </h2>

            {/* Current score display */}
            <div className="text-center mb-4">
              <p className="text-game-text-muted text-sm mb-1">Your current score</p>
              <p className="font-display text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-[linear-gradient(180deg,#ffffff,rgba(255,255,255,0.6))] drop-shadow-[0_0_14px_hsl(190_95%_60%/0.4)]">
                {currentScore.toLocaleString()}
              </p>
            </div>

            {/* Warning text */}
            <p className="text-game-text-muted text-sm text-center mb-6">
              Your progress will be lost and this score won't be saved.
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-game-accent to-emerald-400 hover:from-emerald-400 hover:to-game-accent text-black font-bold py-5 rounded-xl"
              >
                Keep Playing
              </Button>
              
              <Button
                onClick={onConfirm}
                variant="ghost"
                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Home className="w-4 h-4 mr-2" />
                Quit to Menu
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExitConfirmModal;
