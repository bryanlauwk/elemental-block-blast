import { Tetromino } from '@/game/types';
import { ElementBlock } from './ElementBlock';

interface NextPiecePreviewProps {
  nextPieces: Tetromino[];
}

export function NextPiecePreview({ nextPieces }: NextPiecePreviewProps) {
  const renderPiece = (tetromino: Tetromino, index: number) => {
    const positions = tetromino.shape[0];
    
    // Calculate bounds
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    
    // Create grid
    const grid: (string | null)[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => null)
    );
    
    positions.forEach((p, i) => {
      grid[p.y - minY][p.x - minX] = tetromino.elements[i];
    });

    const size = index === 0 ? 24 : 18;

    return (
      <div
        key={index}
        className={`grid gap-0.5 ${index === 0 ? 'mb-4' : 'mb-2 opacity-60'}`}
        style={{
          gridTemplateColumns: `repeat(${width}, ${size}px)`,
          gridTemplateRows: `repeat(${height}, ${size}px)`,
        }}
      >
        {grid.flat().map((element, i) => (
          <div key={i} className="flex items-center justify-center">
            {element && (
              <ElementBlock element={element as any} size={size} isPreview />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
        Next Samples
      </h3>
      <div className="flex flex-col items-center">
        {nextPieces.slice(0, 3).map((piece, i) => renderPiece(piece, i))}
      </div>
    </div>
  );
}
