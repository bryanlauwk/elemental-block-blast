import { motion, AnimatePresence } from 'framer-motion';

interface ComboDisplayProps {
  count: number;
  show: boolean;
}

export function ComboDisplay({ count, show }: ComboDisplayProps) {
  return (
    <AnimatePresence>
      {show && count > 1 && (
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, y: -50 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-6 py-3 rounded-lg shadow-2xl">
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-3xl font-black tracking-wider"
            >
              COMBO x{count}!
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
