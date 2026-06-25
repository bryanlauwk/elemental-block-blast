import { PieceTray } from '@/components/game/PieceTray';
import { DraggablePiece } from '@/game/types';

interface CubeTrayDockProps {
  pieces: DraggablePiece[];
  selectedPiece: DraggablePiece | null;
  disabled: boolean;
  onSelectPiece: (piece: DraggablePiece | null) => void;
  onDragHover: (piece: DraggablePiece, clientX: number, clientY: number, pointerType: string) => void;
  onDragDrop: (piece: DraggablePiece, clientX: number, clientY: number, pointerType: string) => void;
}

export function CubeTrayDock({
  pieces,
  selectedPiece,
  disabled,
  onSelectPiece,
  onDragHover,
  onDragDrop,
}: CubeTrayDockProps) {
  return (
    <div className="z-20 w-[calc(100%-2rem)] max-w-md rounded-[30px] border border-white/15 bg-white/10 px-4 pb-4 pt-3 shadow-2xl shadow-black/20 backdrop-blur-xl mb-5">
      <PieceTray
        pieces={pieces}
        selectedPiece={selectedPiece}
        onSelectPiece={onSelectPiece}
        onDragHover={onDragHover}
        onDragDrop={onDragDrop}
        disabled={disabled}
      />
    </div>
  );
}
