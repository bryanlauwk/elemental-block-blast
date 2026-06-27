import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ReactionParticles from './ReactionParticles';

// Prevent Framer Motion rAF loops from hanging jsdom.
vi.mock('framer-motion', () => {
  const React = require('react');
  const Plain = (tag: string) => ({ children, ...rest }: any) =>
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

});
