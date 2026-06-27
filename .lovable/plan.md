## Hero Redesign Plan — Neon Alley Cat & Phase-Cycling Backdrop

### Goal
Replace the static glass-block mascot on the landing screen with an **ambient, non-interactive scene**: a hand-illustrated neon alley cat that wanders across the hero area, while the background softly cycles through the four game phases (Sandbox → Toy Factory → Cloud City → Volcano Run) as a slow atmospheric loop.

---

### 1. Artwork Generation

Generate **4 PNG frames** of the same cat character so the wander animation feels hand-drawn, not AI-slideshow:

| Frame | Pose | Transparent BG |
|-------|------|---------------|
| `alley-cat-walk-1.png` | Standing, looking left | Yes |
| `alley-cat-walk-2.png` | Mid-stride, tail up | Yes |
| `alley-cat-sit.png` | Sitting, looking around | Yes |
| `alley-cat-stretch.png` | Stretching/yawning | Yes |

**Prompt direction (re-usable for all 4):**
> "A small cute neon alley cat, hand-painted 2D game sprite style, soft brush strokes, glowing cyan and magenta edge highlights, cozy lo-fi aesthetic, flat perspective, solid white background."

All frames are generated with `transparent_background: false` (white bg) and then processed via `imagegen--edit_image` with `transparent_background: true` to remove the white background, or generated directly as transparent PNGs if the model supports it.

Asset workflow: generate → upload with `lovable-assets create` → reference via `.asset.json` pointers.

---

### 2. New Component: `HeroAlleyCat.tsx`

A self-contained Framer-Motion component that lives inside the hero cluster on the landing page only.

**Behaviour (passive, no user input):**
1. **Enter** — Cat fades in from the left edge, walking pose cycle (frames 1→2 loop) over ~1.2 s.
2. **Wander** — Moves to a random x-position within the hero bounds (left 10 % → right 70 %) over 4–7 s, ease-in-out.
3. **Pause** — Switches to `sit` frame for 2–4 s.
4. **Stretch** — Brief `stretch` frame (0.6 s).
5. **Resume wander** — Back to walk cycle, new target position.
6. **Loop** forever while the landing page is visible.

**Visual details:**
- Size: `w-20 sm:w-24 md:w-28` (roughly replaces the old mascot footprint).
- Anchored to the **bottom** of the hero cluster so it appears to stroll along the "alley floor" beneath the title.
- Subtle neon glow filter: `drop-shadow(0 0 10px hsl(var(--neon-cyan) / 0.45))`.
- Reduced-motion: if `useReducedMotion()` is true, freeze on `sit` frame with a gentle float (`y: [0, -4px]` loop).

**Implementation sketch:**
```tsx
const WALK_CYCLE = [walk1, walk2];
// framer-motion animate={x: targetX} on a motion.div
// Image swap via state + setTimeout (not rapid rAF) to keep it cheap
```

---

### 3. Phase-Cycling Hero Backdrop

Inside the **landing-only** hero area (not the global `LofiAlleyBackdrop`), add a second, local atmosphere layer that slowly crossfades through the four phase moods.

**Phase mood colors (CSS gradients, no new images needed):**
| Phase | Gradient |
|-------|----------|
| Sandbox | `radial-gradient(ellipse 70% 50% at 50% 28%, hsl(190 95% 60% / 0.14), transparent 70%)` |
| Toy Factory | `radial-gradient(ellipse 70% 50% at 50% 28%, hsl(42 100% 60% / 0.14), transparent 70%)` |
| Cloud City | `radial-gradient(ellipse 70% 50% at 50% 28%, hsl(268 85% 70% / 0.14), transparent 70%)` |
| Volcano Run | `radial-gradient(ellipse 70% 50% at 50% 28%, hsl(0 85% 55% / 0.14), transparent 70%)` |

**Cycle timing:**
- Hold each phase tint for **6 s**.
- Crossfade transition: **2.5 s** ease-in-out.
- Total loop: **34 s** (4 × (6 + 2.5) − overlap correction).
- Reduced motion: freeze on Sandbox tint, disable cycling.

**Placement:** this tint sits **between** the global alley backdrop and the hero content, scoped to the landing page via an `absolute inset-0` div inside the hero cluster so it does not bleed into gameplay.

---

### 4. Home Page Integration

In `src/pages/Index.tsx` (landing state, `!hasStarted`):

1. **Remove** the static `<motion.img src={heroMascot} …>` block.
2. **Replace** with `<HeroAlleyCat />` positioned at the bottom of the hero cluster, using the same `relative w-full flex items-center justify-center` wrapper.
3. **Insert** the phase-cycling tint as an `absolute inset-0` child of the hero wrapper, behind the title but in front of the global backdrop.
4. **Keep** the floating decorative block props (cyan & magenta squares) — they now read as "alley litter" the cat might investigate, reinforcing the scene.

**Layout adjustments:**
- Increase hero wrapper min-height slightly so the cat has room to wander horizontally without clipping on mobile.
- Ensure the cat’s z-index sits **below** the title (`z-10`) but **above** the phase tint.

---

### 5. Responsive & Performance Guardrails

| Concern | Mitigation |
|---------|-----------|
| Image size | Generate at 512×512 max; compress PNGs before asset upload. |
| Motion cost | Walk cycle uses CSS `steps()` or state-based image swaps, not continuous `requestAnimationFrame`. Position uses Framer Motion `animate` (GPU). |
| Mobile width | Cat wanders within `left: 5% → right: 55%` on screens `< 640 px` to avoid collision with the element-tile row. |
| Reduced motion | `useReducedMotion()` pauses walk cycle and phase tint; cat sits still with a 3 s gentle float. |

---

### 6. Acceptance Criteria

- [ ] Landing page shows the neon alley cat wandering, sitting, and stretching on a loop.
- [ ] The global lo-fi alley backdrop remains untouched; the phase tint is local to the hero.
- [ ] Phase tint cycles through 4 colors smoothly every ~8.5 s.
- [ ] Cat never overlaps the title text; sits below it on the "alley floor".
- [ ] Reduced-motion mode freezes the cat and disables phase cycling.
- [ ] No layout shift on mobile; cat stays within safe margins.
- [ ] Old `hero-mascot.png` asset is removed via `lovable-assets delete`.

---

### 7. Files to Create / Modify

| File | Action |
|------|--------|
| `src/components/game/HeroAlleyCat.tsx` | New — cat animation component |
| `src/components/game/HeroPhaseTint.tsx` | New — phase-cycling backdrop tint |
| `src/pages/Index.tsx` | Modify — swap mascot for cat + insert tint |
| `src/assets/alley-cat-*.png` (4 files) | Generate + upload as assets |
| `src/assets/hero-mascot.png.asset.json` | Delete old mascot pointer |

No new dependencies required. Framer Motion is already in the project.