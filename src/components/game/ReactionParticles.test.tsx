import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReactionParticles from './ReactionParticles';

// Prevent Framer Motion rAF loops from hanging jsdom.
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const Plain = (tag: string) => ({ children, key, ...rest }: any) =>
    React.createElement(tag, rest, children);
  return {
    motion: { span: Plain('span'), div: Plain('div') },
    AnimatePresence: ({ children }: any) => children,
  };
});

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
