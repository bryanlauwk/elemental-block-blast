import { useEffect, useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useHighScores } from '@/hooks/useHighScores';
import { GameGrid } from '@/components/game/GameGrid';
import { NextPiecePreview } from '@/components/game/NextPiecePreview';
import { PeriodicTable } from '@/components/game/PeriodicTable';
import { Scoreboard } from '@/components/game/Scoreboard';
import { ComboDisplay } from '@/components/game/ComboDisplay';
import { TouchControls } from '@/components/game/TouchControls';
import { GameControls } from '@/components/game/GameControls';
import { KeyboardHints } from '@/components/game/KeyboardHints';
import { Leaderboard } from '@/components/game/Leaderboard';
import { Beaker, FlaskConical } from 'lucide-react';

const Index = () => {
  const {
    gameState,
    shakeIntensity,
    comboDisplay,
    startGame,
    pauseGame,
    resumeGame,
    moveLeft,
    moveRight,
    moveDown,
    hardDrop,
    rotateClockwise,
    rotateCounterClockwise,
  } = useGameEngine();

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

  useKeyboardControls({
    onMoveLeft: moveLeft,
    onMoveRight: moveRight,
    onMoveDown: moveDown,
    onHardDrop: hardDrop,
    onRotateClockwise: rotateClockwise,
    onRotateCounterClockwise: rotateCounterClockwise,
    onPause: pauseGame,
    onResume: resumeGame,
    isPaused: gameState.isPaused,
    isGameOver: gameState.isGameOver,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="text-center py-4 border-b border-slate-800">
        <div className="flex items-center justify-center gap-3">
          <FlaskConical className="w-8 h-8 text-green-400" />
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            <span className="text-orange-400">Elemental</span>{' '}
            <span className="text-blue-400">Tetris</span>
          </h1>
          <Beaker className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-slate-500 text-sm mt-1">The Meltdown Edition</p>
      </header>

      {/* Main Game Area */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          {/* Left Sidebar - Mobile: Hidden */}
          <aside className="hidden lg:flex flex-col gap-4 w-48">
            <Scoreboard score={gameState.score} isGameOver={gameState.isGameOver} topScore={topScore} />
            <Leaderboard highScores={highScores} currentScore={gameState.isGameOver ? gameState.score : undefined} onClear={clearScores} />
            <KeyboardHints />
          </aside>

          {/* Game Board */}
          <div className="relative flex flex-col items-center">
            {/* Mobile Score */}
            <div className="lg:hidden mb-4 w-full max-w-xs">
              <Scoreboard score={gameState.score} isGameOver={gameState.isGameOver} topScore={topScore} />
            </div>

            <GameGrid
              grid={gameState.grid}
              currentPiece={gameState.currentPiece}
              currentPosition={gameState.currentPosition}
              shakeIntensity={shakeIntensity}
            />
            
            <ComboDisplay count={comboDisplay.count} show={comboDisplay.show} />

            {/* Pause Overlay */}
            {gameState.isPaused && !gameState.isGameOver && gameState.currentPiece && (
              <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400 mb-2">⏸️ PAUSED</p>
                  <p className="text-slate-400 text-sm">Press P to resume</p>
                </div>
              </div>
            )}

            {/* Touch Controls */}
            <TouchControls
              onMoveLeft={moveLeft}
              onMoveRight={moveRight}
              onMoveDown={moveDown}
              onRotate={rotateClockwise}
              onHardDrop={hardDrop}
              disabled={gameState.isPaused || gameState.isGameOver}
            />
          </div>

          {/* Right Sidebar */}
          <aside className="flex flex-col gap-4 w-full lg:w-48">
            <GameControls
              isPaused={gameState.isPaused}
              isGameOver={gameState.isGameOver}
              onStart={startGame}
              onPause={pauseGame}
              onResume={resumeGame}
            />
            <NextPiecePreview nextPieces={gameState.nextPieces} />
            <PeriodicTable />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-slate-600 text-xs">
        <p>⚠️ No actual chemicals were harmed in this simulation ⚠️</p>
      </footer>
    </div>
  );
};

export default Index;
