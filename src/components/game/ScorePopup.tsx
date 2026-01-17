import { motion, AnimatePresence } from 'framer-motion';

interface ScorePopupProps {
  score: number;
  show: boolean;
  text: string;
}

export function ScorePopup({ score, show, text }: ScorePopupProps) {
  return (
    <AnimatePresence>
      {show && score > 0 && (
        <motion.div
          initial={{ scale: 0, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: -50, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50"
        >
          {/* Score value */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.4, repeat: 2 }}
            className="text-center"
          >
            <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
              +{score}
            </span>
          </motion.div>
          
          {/* Combo text */}
          {text && (
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mt-2"
            >
              <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                {text}
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
