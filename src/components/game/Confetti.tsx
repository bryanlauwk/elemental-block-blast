import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: 'square' | 'circle' | 'triangle';
}

const confettiColors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Lavender
  '#FF9F43', // Orange
  '#00D2D3', // Cyan
];

export const Confetti = ({ count = 25 }: { count?: number }) => {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: Math.random() * 12 + 6,
      delay: Math.random() * 5,
      duration: Math.random() * 8 + 6,
      rotation: Math.random() * 360,
      shape: (['square', 'circle', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    }));
  }, [count]);

  const renderShape = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`,
            }}
          />
        );
      default:
        return (
          <div
            className="rounded-sm"
            style={{
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: piece.color,
            }}
          />
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: -20,
          }}
          initial={{ y: -50, rotate: 0, opacity: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            rotate: [piece.rotation, piece.rotation + 720],
            opacity: [0, 1, 1, 0],
            x: [0, Math.sin(piece.id) * 50, Math.cos(piece.id) * -50, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {renderShape(piece)}
        </motion.div>
      ))}
    </div>
  );
};

export default Confetti;
