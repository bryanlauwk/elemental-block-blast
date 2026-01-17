import { motion } from 'framer-motion';

// Perspective grid lines
const GridLines = () => {
  const verticalLines = 12;
  const horizontalLines = 8;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Vertical lines with perspective */}
      {Array.from({ length: verticalLines }).map((_, i) => {
        const x = (i / (verticalLines - 1)) * 100;
        const skew = (x - 50) * 0.4;
        return (
          <motion.div
            key={`v-${i}`}
            className="absolute h-full w-px"
            style={{
              left: `${x}%`,
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                hsl(var(--game-grid-border) / 0.1) 20%,
                hsl(var(--game-grid-border) / 0.3) 80%,
                hsl(var(--game-accent) / 0.5) 100%
              )`,
              transform: `skewX(${skew}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
          />
        );
      })}
      
      {/* Horizontal lines */}
      {Array.from({ length: horizontalLines }).map((_, i) => {
        const y = 40 + (i / (horizontalLines - 1)) * 60;
        const opacity = 0.1 + (i / horizontalLines) * 0.3;
        return (
          <motion.div
            key={`h-${i}`}
            className="absolute w-full h-px"
            style={{
              top: `${y}%`,
              background: `linear-gradient(to right, 
                transparent 5%, 
                hsl(var(--game-grid-border) / ${opacity}) 20%,
                hsl(var(--game-grid-border) / ${opacity * 1.5}) 50%,
                hsl(var(--game-grid-border) / ${opacity}) 80%,
                transparent 95%
              )`,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          />
        );
      })}
    </div>
  );
};

// Center glow effect
const CenterGlow = () => (
  <motion.div
    className="absolute left-1/2 bottom-1/4 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
    style={{
      background: `radial-gradient(ellipse at center, 
        hsl(var(--game-accent) / 0.15) 0%, 
        hsl(var(--game-accent) / 0.05) 40%,
        transparent 70%
      )`,
    }}
    animate={{
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Floating particles
const FloatingParticles = () => {
  const particles = [
    { x: '15%', y: '60%', size: 4, delay: 0 },
    { x: '85%', y: '55%', size: 3, delay: 0.5 },
    { x: '25%', y: '75%', size: 5, delay: 1 },
    { x: '75%', y: '70%', size: 3, delay: 0.3 },
    { x: '50%', y: '85%', size: 4, delay: 0.8 },
    { x: '35%', y: '65%', size: 3, delay: 1.2 },
    { x: '65%', y: '80%', size: 4, delay: 0.6 },
  ];

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: 'hsl(var(--game-accent))',
            boxShadow: `0 0 ${p.size * 2}px hsl(var(--game-accent) / 0.5)`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + Math.random(),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </>
  );
};

// Side gradient overlays
const SideGradients = () => (
  <>
    <div 
      className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none"
      style={{
        background: 'linear-gradient(to right, hsl(var(--game-bg-end)) 0%, transparent 100%)',
      }}
    />
    <div 
      className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
      style={{
        background: 'linear-gradient(to left, hsl(var(--game-bg-end)) 0%, transparent 100%)',
      }}
    />
  </>
);

export const BackgroundDoodles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center top, 
            hsl(var(--game-bg-start)) 0%, 
            hsl(var(--game-bg-end)) 100%
          )`,
        }}
      />
      
      {/* Perspective grid */}
      <GridLines />
      
      {/* Center glow */}
      <CenterGlow />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Side gradients for vignette */}
      <SideGradients />
    </div>
  );
};

export default BackgroundDoodles;
