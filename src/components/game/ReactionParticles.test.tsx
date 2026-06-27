import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReactionParticles from './ReactionParticles';

// Mock motion preferences so reduced motion is active.
vi.mock('@/game/motionPreferences', () => ({
  isReducedMotion: () => true,
  subscribeReducedMotion: () => () => {},
}));

describe('ReactionParticles (reduced-motion bomb ripple)', () => {
  it('renders exactly 1 shockwave ripple ring in reduced motion', () => {
    const { container } = render(
      <ReactionParticles
        trigger={{
          type: 'bomb',
          positions: [{ x: 3, y: 3 }],
          timestamp: Date.now(),
        }}
        cellSize={44}
      />
    );

    const ripples = container.querySelectorAll('[data-testid="bomb-ripple"]');
    expect(ripples).toHaveLength(1);
  });

  it('clears the ripple within the target cleanup time (≤420 ms)', async () => {
    const { container } = render(
      <ReactionParticles
        trigger={{
          type: 'bomb',
          positions: [{ x: 3, y: 3 }],
          timestamp: Date.now(),
        }}
        cellSize={44}
      />
    );

    expect(container.querySelectorAll('[data-testid="bomb-ripple"]')).toHaveLength(1);

    // Wait just past the 420 ms cleanup threshold.
    await new Promise((r) => setTimeout(r, 430));

    expect(container.querySelectorAll('[data-testid="bomb-ripple"]')).toHaveLength(0);
  });
});
