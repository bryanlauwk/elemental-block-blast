import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SoundSettings } from './SoundSettings';
import { LOFI_MUSIC_PRESETS } from '@/game/sounds';

beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, value: 390 });
  Object.defineProperty(window, 'innerHeight', { writable: true, value: 720 });
  if (!('ResizeObserver' in globalThis)) {
    (globalThis as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('SoundSettings (mobile)', () => {
  it('renders all 8 lo-fi mood options inside a mobile-safe scrollable shell', () => {
    const { container } = render(<SoundSettings isOpen onClose={() => {}} />);

    expect(LOFI_MUSIC_PRESETS).toHaveLength(8);
    for (const preset of LOFI_MUSIC_PRESETS) {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    }

    const shell = container.querySelector('.neon-modal-shell');
    expect(shell).not.toBeNull();
    expect(shell!.className).toMatch(/neon-modal-shell--scroll/);

    const mobileViewportWrapper = container.querySelector('.fixed.inset-2');
    expect(mobileViewportWrapper).not.toBeNull();
    expect(mobileViewportWrapper!.className).toMatch(/items-start/);
  });
});