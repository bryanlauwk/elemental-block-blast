## Baked-in Alley Cat Hero — Regenerate Background + Subtle Overlay Animation

### Problem
The current `HeroAlleyCat` sprite floats over the alley with a visible grey contact shadow and slides left/right unnaturally. No amount of blur/fog blending fixes the "sticker on background" feel because the sprite was never lit by the same scene.

### New Approach
Bake the cat **into** the alley artwork itself, then layer only tiny, looped micro-animations (tail swing + eye blink) on top — anchored exactly where the cat sits in the painted image.

---

### 1. Regenerate the hero backdrop (single composed image)

Generate one new wide hero image (1920×1024) that replaces `src/assets/lofi-neon-alley.jpg` for the **landing hero area only** (keep the existing alley image for gameplay backdrop untouched to avoid regressions).

Prompt direction:
> "Cozy neon city alley at night, anime lo-fi game background, soft brush painted, glowing cyan and magenta signs, wet reflective ground, warm window lights. A small cute neon cat sits naturally on the alley floor in the lower-center, eyes half-closed, tail curled — fully painted into the scene with matching lighting, reflections on the wet ground beneath it, and ambient cyan/magenta rim light. No sticker look. Cinematic depth of field."

Save to `src/assets/hero-alley-with-cat.jpg` and upload via `lovable-assets create`.

### 2. Tiny overlay animations (no sprite movement)

Replace `HeroAlleyCat.tsx` with `HeroCatOverlay.tsx`, which positions two micro-elements **absolutely** over the baked image at the cat's painted location:

- **Tail tip**: a small transparent PNG of just the tail tip, generated to match. Anchored at the tail base, animated with a gentle CSS rotation `[-6deg, 6deg]` over 2.4s ease-in-out infinite.
- **Eye blink**: two tiny dark ellipses (CSS only, no image) positioned at the cat's eye coordinates, with `scaleY: [1, 0.05, 1]` blink every 4–6s (randomized).

Both overlays use percentage positioning relative to the hero image container so they scale with viewport. Reduced motion: hide overlays entirely (cat just sits still in the painted scene).

### 3. Wire into landing hero

In `src/pages/Index.tsx`:
- Replace the `<HeroAlleyCat />` block with a `<div>` that renders the new baked image as `<img>` and `<HeroCatOverlay />` absolutely positioned on top.
- Remove `HeroPhaseTint` usage from inside this hero block (or keep it as a screen-blend over the new image — TBD, default: keep it for phase color cycling, opacity reduced to 0.6 since the new image is more dominant).
- Delete `HeroAlleyCat.tsx` and its 4 cat sprite assets (`alley-cat-walk-1/2`, `sit`, `stretch`) via `lovable-assets delete`.

### 4. Files

| File | Action |
|------|--------|
| `src/assets/hero-alley-with-cat.jpg` | New baked hero image |
| `src/assets/tail-tip.png` | New small tail-tip sprite |
| `src/components/game/HeroCatOverlay.tsx` | New — tail + eye-blink overlay |
| `src/components/game/HeroAlleyCat.tsx` | Delete |
| `src/assets/alley-cat-walk-1/2/sit/stretch.png.asset.json` | Delete (4 files) |
| `src/pages/Index.tsx` | Swap component + image |

### Acceptance
- Cat is part of the painted alley — no grey shadow, no horizontal sliding.
- Only the tail tip sways and the eyes blink occasionally.
- Reduced motion freezes everything to the still painting.
- Gameplay backdrop unchanged.
