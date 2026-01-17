import { motion } from 'framer-motion';

const sparkles = [
  { x: '10%', y: '20%', size: 4, delay: 0, duration: 2.5 },
  { x: '85%', y: '25%', size: 3, delay: 0.5, duration: 3 },
  { x: '15%', y: '70%', size: 5, delay: 1, duration: 2.8 },
  { x: '90%', y: '75%', size: 3, delay: 0.3, duration: 3.2 },
  { x: '50%', y: '10%', size: 4, delay: 0.8, duration: 2.6 },
  { x: '30%', y: '90%', size: 3, delay: 1.2, duration: 3 },
  { x: '70%', y: '5%', size: 4, delay: 0.2, duration: 2.9 },
  { x: '5%', y: '50%', size: 5, delay: 0.7, duration: 2.7 },
  { x: '95%', y: '45%', size: 3, delay: 1.5, duration: 3.1 },
  { x: '45%', y: '95%', size: 4, delay: 0.4, duration: 2.5 },
];

const formulas = [
  { text: 'H₂O', x: '8%', y: '35%', delay: 0, duration: 8 },
  { text: 'CO₂', x: '92%', y: '40%', delay: 2, duration: 9 },
  { text: 'NaCl', x: '12%', y: '85%', delay: 4, duration: 7 },
  { text: 'Fe', x: '88%', y: '90%', delay: 1, duration: 10 },
  { text: 'O₂', x: '25%', y: '5%', delay: 3, duration: 8.5 },
  { text: 'He', x: '78%', y: '15%', delay: 5, duration: 9.5 },
];

const orbs = [
  { x: '20%', y: '30%', color: 'hsl(var(--game-fire))', size: 80, delay: 0 },
  { x: '80%', y: '20%', color: 'hsl(var(--game-water))', size: 100, delay: 1 },
  { x: '10%', y: '70%', color: 'hsl(var(--game-wood))', size: 60, delay: 2 },
  { x: '85%', y: '75%', color: 'hsl(var(--game-stone))', size: 70, delay: 0.5 },
  { x: '50%', y: '85%', color: 'hsl(var(--game-acid))', size: 50, delay: 1.5 },
];

export const BackgroundDoodles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Soft color orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            opacity: 0.08,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: orb.delay,
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute rounded-full bg-white/30"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: sparkle.delay,
          }}
        />
      ))}

      {/* Chemical formulas */}
      {formulas.map((formula, i) => (
        <motion.span
          key={`formula-${i}`}
          className="absolute text-white/10 font-mono text-sm select-none"
          style={{
            left: formula.x,
            top: formula.y,
          }}
          animate={{
            opacity: [0.05, 0.12, 0.05],
            y: [0, -10, 0],
          }}
          transition={{
            duration: formula.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: formula.delay,
          }}
        >
          {formula.text}
        </motion.span>
      ))}
    </div>
  );
};

export default BackgroundDoodles;
