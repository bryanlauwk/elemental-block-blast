import { motion } from 'framer-motion';

// Clean perspective grid - blue only, Block Blast style
const GridLines = () => {
  const verticalLines = 10;
  const horizontalLines = 6;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Vertical lines with perspective */}
      {Array.from({ length: verticalLines }).map((_, i) => {
        const x = (i / (verticalLines - 1)) * 100;
        const skew = (x - 50) * 0.3;
        return (
          <motion.div
            key={`v-${i}`}
            className="absolute h-full w-px"
            style={{
              left: `${x}%`,
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                rgba(100, 180, 255, 0.12) 30%,
                rgba(100, 180, 255, 0.2) 70%,
                rgba(100, 180, 255, 0.4) 100%
              )`,
              transform: `skewX(${skew}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          />
        );
      })}
      
      {/* Horizontal lines */}
      {Array.from({ length: horizontalLines }).map((_, i) => {
        const y = 50 + (i / (horizontalLines - 1)) * 50;
        const opacity = 0.1 + (i / horizontalLines) * 0.2;
        return (
          <motion.div
            key={`h-${i}`}
            className="absolute w-full h-px"
            style={{
              top: `${y}%`,
              background: `linear-gradient(to right, 
                transparent 10%, 
                rgba(100, 180, 255, ${opacity}) 30%,
                rgba(100, 180, 255, ${opacity * 1.5}) 50%,
                rgba(100, 180, 255, ${opacity}) 70%,
                transparent 90%
              )`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          />
        );
      })}
    </div>
  );
};

// Bottom spotlight/beam effect
const BottomSpotlight = () => (
  <motion.div
    className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
    style={{
      background: `radial-gradient(ellipse at center bottom, 
        rgba(56, 189, 248, 0.25) 0%,
        rgba(59, 130, 246, 0.15) 30%,
        rgba(99, 102, 241, 0.08) 50%,
        transparent 70%
      )`,
    }}
    animate={{
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Subtle vignette
const Vignette = () => (
  <div 
    className="absolute inset-0 pointer-events-none"
    style={{
      background: `radial-gradient(ellipse at center, 
        transparent 40%,
        rgba(15, 23, 42, 0.3) 70%,
        rgba(15, 23, 42, 0.6) 100%
      )`,
    }}
  />
);

export const BackgroundDoodles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - clean deep blue like Block Blast */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            hsl(220, 70%, 12%) 0%,
            hsl(225, 65%, 15%) 30%,
            hsl(230, 60%, 18%) 60%,
            hsl(220, 55%, 20%) 100%
          )`,
        }}
      />
      
      {/* Perspective grid - subtle blue */}
      <GridLines />
      
      {/* Bottom spotlight */}
      <BottomSpotlight />
      
      {/* Vignette for depth */}
      <Vignette />
    </div>
  );
};

export default BackgroundDoodles;
