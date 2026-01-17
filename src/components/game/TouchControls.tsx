import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowDown, 
  RotateCw, 
  ChevronsDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  disabled?: boolean;
}

export function TouchControls({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  disabled = false,
}: TouchControlsProps) {
  return (
    <div className="flex flex-col items-center gap-2 mt-4 md:hidden">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full bg-slate-800 border-slate-600"
          onTouchStart={(e) => { e.preventDefault(); onRotate(); }}
          onClick={onRotate}
          disabled={disabled}
        >
          <RotateCw className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full bg-orange-900/50 border-orange-600"
          onTouchStart={(e) => { e.preventDefault(); onHardDrop(); }}
          onClick={onHardDrop}
          disabled={disabled}
        >
          <ChevronsDown className="w-6 h-6" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full bg-slate-800 border-slate-600"
          onTouchStart={(e) => { e.preventDefault(); onMoveLeft(); }}
          onClick={onMoveLeft}
          disabled={disabled}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full bg-slate-800 border-slate-600"
          onTouchStart={(e) => { e.preventDefault(); onMoveDown(); }}
          onClick={onMoveDown}
          disabled={disabled}
        >
          <ArrowDown className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full bg-slate-800 border-slate-600"
          onTouchStart={(e) => { e.preventDefault(); onMoveRight(); }}
          onClick={onMoveRight}
          disabled={disabled}
        >
          <ArrowRight className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
