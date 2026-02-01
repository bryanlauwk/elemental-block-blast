
# Animation Performance Optimization Plan

## Overview

This plan addresses animation lag and stuttering observed during gameplay on PC. The investigation revealed multiple performance bottlenecks across the game's animation system.

## Root Causes Identified

### 1. Infinite Repeating Animations Running Simultaneously
Multiple components have `repeat: Infinity` animations that run continuously during gameplay:

- **BlockBlastGrid.tsx**: Reaction preview animations with `repeat: Infinity` on every affected cell
- **ComboDisplay.tsx**: Scale animation pulses infinitely during combo display
- **AchievementPopup.tsx**: Multiple sparkle animations with `repeat: Infinity`
- **ReactionTutorial.tsx**: 8+ infinite animations running when tutorial is visible

### 2. Unoptimized Grid Cell Re-renders
- **BlockBlastGrid.tsx** renders 64 cells (8x8 grid) on every state change
- Each cell creates multiple motion components with animations
- No memoization on individual grid cells
- Touch handlers recreated on every render

### 3. ReactionParticles Spawning Too Many Elements
- Creates 6-10 particles per reaction position
- Multiple reactions can spawn 50+ animated elements simultaneously
- Particles use complex animations with transforms, opacity, and rotation

### 4. ElementBlock Re-animates on Every Render
- Initial scale/opacity animation triggers on every mount
- No `layoutId` optimization for smooth transitions
- Box-shadow calculations are expensive with multiple layers

### 5. AnimatePresence Mode Issues
- Using `mode="popLayout"` in ReactionFeed causes layout recalculations
- Multiple nested AnimatePresence components compete for animation frames

---

## Technical Implementation

### Part 1: Memoize Grid Cells

**File: `src/components/game/BlockBlastGrid.tsx`**

Create a memoized GridCell component to prevent unnecessary re-renders:

```tsx
// Extract to separate memoized component
const GridCell = React.memo(({ 
  cell, x, y, isPreview, previewElement, reactionType, sourceType, 
  isValidPreview, selectedPiece, onCellHover, onCellClick, cellSize 
}) => {
  // Cell rendering logic moved here
});
```

### Part 2: Reduce Particle Count and Simplify Animations

**File: `src/components/game/ReactionParticles.tsx`**

1. Reduce particle count from 6-10 to 3-4 per position
2. Use CSS animations instead of Framer Motion for particles
3. Add `will-change: transform` for GPU acceleration
4. Use `transform` instead of individual x/y properties

Changes:
- `particleConfig.burn.count`: 8 → 4
- `particleConfig.extinguish.count`: 10 → 5
- `particleConfig.dissolve.count`: 6 → 3
- Replace Framer Motion with CSS keyframe animations

### Part 3: Optimize Infinite Animations

**File: `src/components/game/BlockBlastGrid.tsx`**

Replace infinite Framer Motion animations with CSS animations for reaction previews:

```css
/* Add to index.css */
@keyframes pulse-reaction {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.animate-reaction-pulse {
  animation: pulse-reaction 0.8s ease-in-out infinite;
}
```

**File: `src/components/game/ComboDisplay.tsx`**

Remove `repeat: Infinity` and use CSS animation:

```tsx
// Replace Framer Motion infinite with CSS
className="text-3xl font-black tracking-wider animate-pulse-scale"
```

### Part 4: Simplify ElementBlock Animations

**File: `src/components/game/ElementBlock.tsx`**

1. Remove initial animation for preview elements
2. Simplify box-shadow to single layer
3. Use `transform: translateZ(0)` for GPU layer promotion

Changes:
```tsx
// Skip animation for preview blocks
initial={isPreview ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
```

### Part 5: Optimize AnimatePresence Usage

**File: `src/components/game/ReactionFeed.tsx`**

Change `mode="popLayout"` to `mode="sync"` to prevent layout thrashing:

```tsx
<AnimatePresence mode="sync">
```

### Part 6: Add Hardware Acceleration Hints

**File: `src/index.css`**

Add CSS optimizations:

```css
/* GPU acceleration for animated elements */
.game-grid-cell {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Optimized reaction animations */
@keyframes pulse-reaction {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes pulse-source {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.animate-reaction-pulse {
  animation: pulse-reaction 0.8s ease-in-out infinite;
  will-change: transform, opacity;
}

.animate-source-pulse {
  animation: pulse-source 0.6s ease-in-out infinite;
  will-change: transform;
}
```

### Part 7: Debounce Hover Events

**File: `src/components/game/BlockBlastGrid.tsx`**

Add debouncing to prevent excessive re-renders during mouse movement:

```tsx
// Use requestAnimationFrame for hover updates
const rafRef = useRef<number | null>(null);

const throttledCellHover = useCallback((pos: Position) => {
  if (rafRef.current) return;
  rafRef.current = requestAnimationFrame(() => {
    onCellHover(pos);
    rafRef.current = null;
  });
}, [onCellHover]);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/game/BlockBlastGrid.tsx` | Memoize cells, CSS animations, throttle hovers |
| `src/components/game/ReactionParticles.tsx` | Reduce count, CSS animations, GPU hints |
| `src/components/game/ElementBlock.tsx` | Conditional animations, simpler shadows |
| `src/components/game/ComboDisplay.tsx` | CSS animation instead of Framer infinite |
| `src/components/game/ReactionFeed.tsx` | Change AnimatePresence mode |
| `src/index.css` | Add GPU acceleration and CSS animations |

---

## Expected Performance Improvements

- **60% fewer animation frames** by replacing Framer Motion infinite loops with CSS
- **Reduced re-renders** through memoization of grid cells
- **Lower particle overhead** with 50% fewer particles per reaction
- **GPU acceleration** for smooth transforms without main thread blocking
- **Smoother hover interactions** with requestAnimationFrame throttling

---

## Mobile Considerations

These optimizations will also benefit mobile devices:
- CSS animations are more battery-efficient than JavaScript animations
- Fewer DOM elements means faster touch event processing
- GPU-accelerated transforms work well on mobile GPUs
