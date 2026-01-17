import { useEffect } from 'react';

interface KeyboardControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onHardDrop: () => void;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  onPause: () => void;
  onResume: () => void;
  isPaused: boolean;
  isGameOver: boolean;
}

export function useKeyboardControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onHardDrop,
  onRotateClockwise,
  onRotateCounterClockwise,
  onPause,
  onResume,
  isPaused,
  isGameOver,
}: KeyboardControlsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          if (!isPaused) onMoveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          if (!isPaused) onMoveRight();
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          if (!isPaused) onMoveDown();
          break;
        case 'Space':
          e.preventDefault();
          if (!isPaused) onHardDrop();
          break;
        case 'ArrowUp':
        case 'KeyX':
          e.preventDefault();
          if (!isPaused) onRotateClockwise();
          break;
        case 'KeyZ':
          e.preventDefault();
          if (!isPaused) onRotateCounterClockwise();
          break;
        case 'KeyP':
        case 'Escape':
          e.preventDefault();
          if (isPaused) {
            onResume();
          } else {
            onPause();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPaused,
    isGameOver,
    onMoveLeft,
    onMoveRight,
    onMoveDown,
    onHardDrop,
    onRotateClockwise,
    onRotateCounterClockwise,
    onPause,
    onResume,
  ]);
}
