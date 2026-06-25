# Style layer guide

This project currently has several style layers because the game moved quickly from prototype to UI facelift. To avoid future technical debt, keep each file responsible for one job only.

## `index.css`

Global Tailwind tokens, theme variables, reusable animations, and base game styles.

Use this for:
- color tokens
- base typography
- shared keyframes
- shared utility classes

Avoid putting mode-specific layout rules here.

## `classic-glass.css`

Classic Mode presentation layer.

Use this for:
- Classic board frame styling
- Classic HUD/tray glassmorphism
- Classic mobile fit rules

Avoid using this for Cube Mode.

## `cube-glass.css`

Cube Mode scene layer.

Use this for:
- Cube-specific background treatment
- Cube face visual styling
- Cube HUD/tray compact presentation
- non-destructive environment dressing

Do not use this file to scale or transform the 3D cube container. Cube size and camera should be controlled in `CubeGame.tsx`, not through CSS hacks like `scale` on `[style*="preserve-3d"]`.

## `overhaul-v3.css`

Shared product-level visual direction.

Use this for:
- landing mode selector design
- broad glassmorphism tokens
- non-mode-specific polish

Avoid mode-specific gameplay layout overrides here.

## `performance.css`

Mobile and reduced-motion guardrails.

Use this for:
- reducing blur/shadow intensity
- lowering animation cost
- respecting `prefers-reduced-motion`

Avoid changing game layout or gameplay behavior here.
