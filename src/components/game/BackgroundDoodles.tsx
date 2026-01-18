import { motion } from 'framer-motion';
import RainbowOrbs from './RainbowOrbs';
import Sparkles from './Sparkles';
import Confetti from './Confetti';

// Enhanced perspective grid lines with rainbow colors
const GridLines = () => {
  const verticalLines = 12;
  const horizontalLines = 8;
  const rainbowColors = [
    'rgba(255, 107, 107, 0.3)', // Red
    'rgba(255, 159, 67, 0.3)',  // Orange
    'rgba(255, 230, 109, 0.3)', // Yellow
    'rgba(46, 213, 115, 0.3)',  // Green
    'rgba(30, 144, 255, 0.3)',  // Blue
    'rgba(155, 89, 182, 0.3)',  // Purple
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Vertical lines with perspective and rainbow */}
      {Array.from({ length: verticalLines }).map((_, i) => {
        const x = (i / (verticalLines - 1)) * 100;
        const skew = (x - 50) * 0.4;
        const colorIndex = i % rainbowColors.length;
        return (
          <motion.div
            key={`v-${i}`}
            className="absolute h-full w-px"
            style={{
              left: `${x}%`,
              background: `linear-gradient(to bottom, 
                transparent 0%, 
                ${rainbowColors[colorIndex]} 20%,
                ${rainbowColors[(colorIndex + 1) % rainbowColors.length]} 80%,
                hsl(var(--game-accent) / 0.6) 100%
              )`,
              transform: `skewX(${skew}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
          />
        );
      })}
      
      {/* Horizontal lines with rainbow shimmer */}
      {Array.from({ length: horizontalLines }).map((_, i) => {
        const y = 40 + (i / (horizontalLines - 1)) * 60;
        const opacity = 0.15 + (i / horizontalLines) * 0.35;
        return (
          <motion.div
            key={`h-${i}`}
            className="absolute w-full h-px"
            style={{
              top: `${y}%`,
              background: `linear-gradient(to right, 
                transparent 5%, 
                rgba(255, 107, 182, ${opacity}) 20%,
                rgba(78, 205, 196, ${opacity * 1.2}) 50%,
                rgba(255, 230, 109, ${opacity}) 80%,
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

// Enhanced center glow with pulsing rainbow
const CenterGlow = () => (
  <motion.div
    className="absolute left-1/2 bottom-1/4 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none"
    style={{
      background: `radial-gradient(ellipse at center, 
        rgba(78, 205, 196, 0.25) 0%,
        rgba(155, 89, 182, 0.15) 30%,
        rgba(255, 107, 182, 0.1) 50%,
        transparent 70%
      )`,
    }}
    animate={{
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Enhanced floating particles with rainbow colors
const FloatingParticles = () => {
  const particles = [
    { x: '15%', y: '60%', size: 6, delay: 0, color: '#FF6B6B' },
    { x: '85%', y: '55%', size: 5, delay: 0.5, color: '#4ECDC4' },
    { x: '25%', y: '75%', size: 7, delay: 1, color: '#FFE66D' },
    { x: '75%', y: '70%', size: 5, delay: 0.3, color: '#AA96DA' },
    { x: '50%', y: '85%', size: 6, delay: 0.8, color: '#FF69B4' },
    { x: '35%', y: '65%', size: 5, delay: 1.2, color: '#00D2D3' },
    { x: '65%', y: '80%', size: 6, delay: 0.6, color: '#FF9F43' },
    { x: '10%', y: '45%', size: 4, delay: 0.9, color: '#F38181' },
    { x: '90%', y: '40%', size: 5, delay: 0.2, color: '#95E1D3' },
    { x: '45%', y: '35%', size: 4, delay: 1.5, color: '#9B59B6' },
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
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -25, 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.3, 1],
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

// Side gradient overlays with colorful tints
const SideGradients = () => (
  <>
    <div 
      className="absolute left-0 top-0 bottom-0 w-40 pointer-events-none"
      style={{
        background: 'linear-gradient(to right, rgba(155, 89, 182, 0.15), transparent 100%)',
      }}
    />
    <div 
      className="absolute right-0 top-0 bottom-0 w-40 pointer-events-none"
      style={{
        background: 'linear-gradient(to left, rgba(78, 205, 196, 0.15), transparent 100%)',
      }}
    />
  </>
);

export const BackgroundDoodles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient - brighter and more vibrant */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center top, 
            hsl(260 60% 30%) 0%,
            hsl(220 70% 15%) 50%,
            hsl(230 75% 10%) 100%
          )`,
        }}
      />
      
      {/* Rainbow orbs - floating colorful blobs */}
      <RainbowOrbs />
      
      {/* Perspective grid with rainbow */}
      <GridLines />
      
      {/* Center glow - rainbow pulsing */}
      <CenterGlow />
      
      {/* Floating particles - colorful dots */}
      <FloatingParticles />
      
      {/* Sparkles overlay */}
      <Sparkles count={25} />
      
      {/* Confetti particles */}
      <Confetti count={20} />
      
      {/* Side gradients for vignette with color */}
      <SideGradients />
    </div>
  );
};

export default BackgroundDoodles;
