import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CubeScene } from './CubeScene';
import { createEmptyGrid } from '@/game/engine';
import { CUBE_FACE_SIZE, CUBE_FACES } from '@/game/cubeConfig';

vi.mock('@/components/game/ElementBlock', () => ({
  ElementBlock: ({ element }: { element: string }) => <div data-testid="element-block">{element}</div>,
}));

vi.mock('@/components/game/ReactionParticles', () => ({
  default: () => <div data-testid="reaction-particles" />,
}));

const boards = CUBE_FACES.map(() => createEmptyGrid(CUBE_FACE_SIZE, CUBE_FACE_SIZE));

describe('CubeScene', () => {
  it('renders four cube faces and a playable active face grid', () => {
    const onPointerDown = vi.fn();
    const onPointerMove = vi.fn();
    const onPointerUp = vi.fn();
    const onHover = vi.fn();
    const onCellClick = vi.fn();

    render(
      <CubeScene
        boards={boards}
        activeFace={0}
        syncedFaces={new Set()}
        size={240}
        half={120}
        pad={8}
        gap={4}
        cellPx={34}
        blockPx={30}
        rot={{ x: 0, y: 0 }}
        snapping
        lastCubeMoment={null}
        fullSyncFlash={0}
        flashKey={0}
        particle={null}
        ghost={new Set()}
        reactionMap={new Map()}
        selected={null}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onHover={onHover}
        onCellClick={onCellClick}
      />,
    );

    expect(screen.getByText('Front')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(document.getElementById('cube-active-grid')).toBeTruthy();
    expect(document.querySelectorAll('[data-cube-cell]').length).toBe(CUBE_FACE_SIZE * CUBE_FACE_SIZE);
  });
});
