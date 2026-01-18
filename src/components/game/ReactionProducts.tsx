import { motion, AnimatePresence } from 'framer-motion';

interface ReactionProduct {
  id: string;
  type: 'steam' | 'sparks' | 'ash' | 'explosion' | 'bubbles' | 'fizz' | 'dissolve';
  x: number;
  y: number;
  timestamp: number;
  elements: string[];
}

interface ReactionProductsProps {
  products: ReactionProduct[];
}

const ReactionProducts = ({ products }: ReactionProductsProps) => {
  return (
    <AnimatePresence>
      {products.map((product) => (
        <div
          key={product.id}
          className="absolute pointer-events-none"
          style={{ left: product.x, top: product.y }}
        >
          {product.type === 'steam' && <SteamEffect />}
          {product.type === 'sparks' && <SparksEffect />}
          {product.type === 'explosion' && <ExplosionEffect />}
          {product.type === 'bubbles' && <BubblesEffect />}
          {product.type === 'fizz' && <FizzEffect />}
          {product.type === 'dissolve' && <DissolveEffect />}
          {product.type === 'ash' && <AshEffect />}
        </div>
      ))}
    </AnimatePresence>
  );
};

// Steam rising effect (Fire + Water)
const SteamEffect = () => {
  const steamClouds = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    x: (Math.random() - 0.5) * 40,
    size: 20 + Math.random() * 30,
  }));

  return (
    <>
      {/* Central flash */}
      <motion.div
        className="absolute rounded-full bg-white"
        style={{ width: 40, height: 40, left: -20, top: -20 }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />

      {/* Steam clouds rising */}
      {steamClouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute"
          style={{ left: cloud.x, top: 0 }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{ y: -120 - cloud.id * 20, opacity: [0, 0.8, 0.6, 0], scale: [0.5, 1.2, 1.5] }}
          transition={{ duration: 2, delay: cloud.delay, ease: 'easeOut' }}
        >
          <div
            className="rounded-full bg-gradient-to-t from-gray-200/60 to-white/40 blur-sm"
            style={{ width: cloud.size, height: cloud.size }}
          />
        </motion.div>
      ))}

      {/* Wispy trails */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`wisp-${i}`}
          className="absolute bg-white/30 rounded-full blur-md"
          style={{
            width: 15,
            height: 30,
            left: (i - 2) * 15,
          }}
          initial={{ y: 0, opacity: 0.6, scaleY: 0.5 }}
          animate={{ y: -80, opacity: 0, scaleY: 2 }}
          transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
        />
      ))}
    </>
  );
};

// Sparks and fire effect (Fire + Wood)
const SparksEffect = () => {
  const sparks = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    angle: (i / 15) * Math.PI * 2 + Math.random() * 0.5,
    distance: 40 + Math.random() * 50,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.2,
  }));

  return (
    <>
      {/* Central fire burst */}
      <motion.div
        className="absolute text-4xl"
        style={{ left: -20, top: -20 }}
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.5, 0], rotate: 180 }}
        transition={{ duration: 0.6 }}
      >
        🔥
      </motion.div>

      {/* Flying sparks */}
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute rounded-full"
          style={{
            width: spark.size,
            height: spark.size,
            background: `radial-gradient(circle, #ffd700, #ff6b35)`,
            boxShadow: '0 0 6px #ff6b35',
          }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.cos(spark.angle) * spark.distance,
            y: Math.sin(spark.angle) * spark.distance - 20,
            opacity: [1, 1, 0],
            scale: [1, 0.5],
          }}
          transition={{ duration: 0.8, delay: spark.delay, ease: 'easeOut' }}
        />
      ))}

      {/* Ember particles rising */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`ember-${i}`}
          className="absolute rounded-full bg-orange-500"
          style={{
            width: 3,
            height: 3,
            left: (Math.random() - 0.5) * 30,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: -60 - Math.random() * 40,
            x: (Math.random() - 0.5) * 40,
            opacity: 0,
          }}
          transition={{ duration: 1.5, delay: 0.3 + i * 0.05 }}
        />
      ))}
    </>
  );
};

// Explosion effect (Fire + Helium)
const ExplosionEffect = () => {
  const confetti = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * Math.PI * 2,
    distance: 60 + Math.random() * 40,
    color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9ff3', '#54a0ff'][i % 5],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <>
      {/* Central explosion flash */}
      <motion.div
        className="absolute rounded-full bg-yellow-300"
        style={{ width: 60, height: 60, left: -30, top: -30 }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 2, 2.5], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.3 }}
      />

      {/* Shockwave ring */}
      <motion.div
        className="absolute rounded-full border-4 border-yellow-400/60"
        style={{ width: 20, height: 20, left: -10, top: -10 }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Explosion emoji */}
      <motion.div
        className="absolute text-5xl"
        style={{ left: -25, top: -25 }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 0], rotate: [0, 20, -20, 0] }}
        transition={{ duration: 0.5 }}
      >
        💥
      </motion.div>

      {/* Confetti pieces */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            borderRadius: 2,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: Math.cos(piece.angle) * piece.distance,
            y: Math.sin(piece.angle) * piece.distance + 40,
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      ))}

      {/* Balloon pieces falling */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`balloon-${i}`}
          className="absolute text-xl"
          style={{ left: (i - 2) * 20 }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: 80 + i * 20,
            rotate: (i % 2 ? 1 : -1) * 180,
            opacity: 0,
          }}
          transition={{ duration: 1.5, delay: 0.2 + i * 0.1 }}
        >
          🎈
        </motion.div>
      ))}
    </>
  );
};

// Bubbles effect (Water + Helium)
const BubblesEffect = () => {
  const bubbles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 60,
    delay: i * 0.1,
    size: 12 + Math.random() * 20,
    popDelay: 0.8 + Math.random() * 0.8,
  }));

  return (
    <>
      {/* Merge splash */}
      <motion.div
        className="absolute text-3xl"
        style={{ left: -15, top: -15 }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 0] }}
        transition={{ duration: 0.4 }}
      >
        💦
      </motion.div>

      {/* Rising bubbles */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute"
          style={{ left: bubble.x }}
          initial={{ y: 0, opacity: 0, scale: 0 }}
          animate={{
            y: -100 - bubble.id * 15,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
            x: [bubble.x, bubble.x + Math.sin(bubble.id) * 20, bubble.x],
          }}
          transition={{
            duration: 2,
            delay: bubble.delay,
            times: [0, 0.2, 0.8, 1],
          }}
        >
          <div
            className="rounded-full border-2 border-cyan-300/60"
            style={{
              width: bubble.size,
              height: bubble.size,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(103,232,249,0.3), transparent)',
            }}
          />
        </motion.div>
      ))}

      {/* Bubble pop emojis */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`pop-${i}`}
          className="absolute text-xl"
          style={{ left: (i - 2) * 25, top: -60 - i * 20 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.3, delay: 0.8 + i * 0.2 }}
        >
          🫧
        </motion.div>
      ))}
    </>
  );
};

// Fizz effect (Acid + Stone)
const FizzEffect = () => {
  const fizzBubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 50,
    delay: Math.random() * 0.5,
    size: 4 + Math.random() * 8,
  }));

  return (
    <>
      {/* Central sizzle */}
      <motion.div
        className="absolute rounded-full bg-green-400"
        style={{ width: 30, height: 30, left: -15, top: -15 }}
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.5, 0] }}
        transition={{ duration: 0.4 }}
      />

      {/* Fizzy bubbles erupting */}
      {fizzBubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            background: 'radial-gradient(circle, #4ade80, #22c55e)',
            boxShadow: '0 0 4px #4ade80',
            left: bubble.x,
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{
            y: -50 - Math.random() * 50,
            x: bubble.x + (Math.random() - 0.5) * 30,
            opacity: 0,
            scale: [1, 1.5, 0],
          }}
          transition={{ duration: 0.8, delay: bubble.delay }}
        />
      ))}

      {/* Toxic fume wisps */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`fume-${i}`}
          className="absolute text-2xl"
          style={{ left: (i - 1) * 20 }}
          initial={{ y: 0, opacity: 0.8 }}
          animate={{ y: -60, opacity: 0, scale: 1.5 }}
          transition={{ duration: 1.2, delay: 0.3 + i * 0.15 }}
        >
          💚
        </motion.div>
      ))}
    </>
  );
};

// Dissolve effect (Acid + Wood)
const DissolveEffect = () => {
  const droplets = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 40,
    delay: Math.random() * 0.3,
  }));

  return (
    <>
      {/* Wobble and melt center */}
      <motion.div
        className="absolute"
        style={{ left: -20, top: -20 }}
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1.2, 0.8, 0],
          scaleY: [1, 0.8, 1.5, 2],
          y: [0, 0, 10, 30],
        }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-4xl">💀</div>
      </motion.div>

      {/* Melting droplets */}
      {droplets.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute rounded-full bg-gradient-to-b from-green-400 to-green-600"
          style={{
            width: 8,
            height: 12,
            left: drop.x,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 50 + Math.random() * 30, opacity: 0 }}
          transition={{ duration: 1, delay: drop.delay }}
        />
      ))}

      {/* Toxic splatter */}
      <motion.div
        className="absolute rounded-full bg-green-500/40 blur-sm"
        style={{ width: 60, height: 20, left: -30, top: 30 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5], opacity: [0, 0.6, 0] }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />
    </>
  );
};

// Ash effect (for burned wood)
const AshEffect = () => {
  const ashParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 60,
    delay: Math.random() * 0.5,
    size: 3 + Math.random() * 5,
  }));

  return (
    <>
      {/* Ash pile forming */}
      <motion.div
        className="absolute rounded-full bg-gray-500/60 blur-sm"
        style={{ width: 40, height: 15, left: -20, top: 10 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />

      {/* Floating ash particles */}
      {ashParticles.map((ash) => (
        <motion.div
          key={ash.id}
          className="absolute rounded-full bg-gray-600"
          style={{
            width: ash.size,
            height: ash.size,
            left: ash.x,
          }}
          initial={{ y: 0, opacity: 0.8 }}
          animate={{
            y: 20 + Math.random() * 20,
            x: ash.x + (Math.random() - 0.5) * 40,
            opacity: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.5, delay: ash.delay }}
        />
      ))}
    </>
  );
};

export default ReactionProducts;
