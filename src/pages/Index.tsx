import { useEffect, useRef, useCallback } from 'react';
import { useBlockBlastEngine } from '@/hooks/useBlockBlastEngine';
import { useHighScores } from '@/hooks/useHighScores';
import { BlockBlastGrid } from '@/components/game/BlockBlastGrid';
import { PieceTray } from '@/components/game/PieceTray';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import { ScorePopup } from '@/components/game/ScorePopup';
import { PeriodicTable } from '@/components/game/PeriodicTable';
import { Leaderboard } from '@/components/game/Leaderboard';
import { Button } from '@/components/ui/button';
import { Atom, Play, RotateCcw } from 'lucide-react';
import { Position } from '@/game/types';

const Index = () => {
  const {
    gameState,
    shakeIntensity,
    comboDisplay,
    scorePopup,
    reactionPreviews,
    startGame,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
  } = useBlockBlastEngine();

  const { highScores, topScore, saveScore, clearScores } = useHighScores();
  const hasGameEnded = useRef(false);

  // Save score when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0 && !hasGameEnded.current) {
      hasGameEnded.current = true;
      saveScore(gameState.score);
    }
    if (!gameState.isGameOver) {
      hasGameEnded.current = false;
    }
  }, [gameState.isGameOver, gameState.score, saveScore]);

  // Handle cell hover for preview
  const handleCellHover = useCallback((pos: Position) => {
    if (gameState.selectedPiece && canPlacePiece(gameState.selectedPiece, pos)) {
      setDropPreview(pos);
    } else if (gameState.selectedPiece) {
      // Try to find a valid position near the hovered cell
      setDropPreview(pos);
    }
  }, [gameState.selectedPiece, canPlacePiece, setDropPreview]);

  // Handle cell click for placement
  const handleCellClick = useCallback((pos: Position) => {
    if (gameState.selectedPiece && canPlacePiece(gameState.selectedPiece, pos)) {
      placePiece(gameState.selectedPiece, pos);
    }
  }, [gameState.selectedPiece, canPlacePiece, placePiece]);

  // Handle grid leave
  const handleGridLeave = useCallback(() => {
    setDropPreview(null);
  }, [setDropPreview]);

  const hasStarted = gameState.availablePieces.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end text-white overflow-hidden">
      {/* Header */}
      <header className="text-center py-4">
        <div className="flex items-center justify-center gap-3">
          <Atom className="w-7 h-7 text-game-accent animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent">
              Elemental Blast
            </span>
          </h1>
          <Atom className="w-7 h-7 text-game-accent animate-pulse" />
        </div>
        <p className="text-game-text-muted text-xs mt-1">Match elements • Clear lines • Chain reactions</p>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-4 pb-6">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          {/* Left Sidebar - Desktop only */}
          <aside className="hidden lg:flex flex-col gap-4 w-56">
            <BlockBlastScoreboard 
              score={gameState.score} 
              topScore={topScore} 
              isGameOver={gameState.isGameOver} 
            />
            <Leaderboard 
              highScores={highScores} 
              currentScore={gameState.isGameOver ? gameState.score : undefined} 
              onClear={clearScores} 
            />
          </aside>

          {/* Game Board Area */}
          <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Score */}
            <div className="lg:hidden w-full">
              <BlockBlastScoreboard 
                score={gameState.score} 
                topScore={topScore} 
                isGameOver={gameState.isGameOver} 
              />
            </div>

            {/* Start/Restart Button */}
            {(!hasStarted || gameState.isGameOver) && (
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-game-accent to-emerald-400 hover:from-emerald-400 hover:to-game-accent text-black font-bold text-lg px-8 py-6 rounded-xl shadow-lg shadow-game-accent/30"
              >
                {hasStarted ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </>
                )}
              </Button>
            )}

            {/* Game Grid */}
            {hasStarted && (
              <div className="relative">
                <BlockBlastGrid
                  grid={gameState.grid}
                  selectedPiece={gameState.selectedPiece}
                  dropPreview={gameState.dropPreview}
                  shakeIntensity={shakeIntensity}
                  canPlacePiece={canPlacePiece}
                  onCellHover={handleCellHover}
                  onCellClick={handleCellClick}
                  onGridLeave={handleGridLeave}
                  reactionPreviews={reactionPreviews}
                />
                
                {/* Score popup overlay */}
                <ScorePopup 
                  score={scorePopup.score} 
                  show={scorePopup.show} 
                  text={comboDisplay.text} 
                />
              </div>
            )}

            {/* Piece Tray */}
            {hasStarted && !gameState.isGameOver && (
              <PieceTray
                pieces={gameState.availablePieces}
                selectedPiece={gameState.selectedPiece}
                onSelectPiece={selectPiece}
                disabled={gameState.isGameOver}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-56">
            <PeriodicTable />
          </aside>
        </div>

        {/* Mobile Leaderboard */}
        <div className="lg:hidden mt-6 max-w-md mx-auto">
          <Leaderboard 
            highScores={highScores} 
            currentScore={gameState.isGameOver ? gameState.score : undefined} 
            onClear={clearScores} 
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-game-text-muted text-xs">
        <p>🧪 Chemistry meets puzzle gaming 🧪</p>
      </footer>
    </div>
  );
};

export default Index;