import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  isPaused: boolean;
  isGameOver: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function GameControls({
  isPaused,
  isGameOver,
  onStart,
  onPause,
  onResume,
}: GameControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {isGameOver ? (
        <Button
          onClick={onStart}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Experiment
        </Button>
      ) : isPaused ? (
        <Button
          onClick={onStart}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Start Lab
        </Button>
      ) : (
        <Button
          onClick={onPause}
          variant="outline"
          className="flex-1"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
      )}
    </div>
  );
}
