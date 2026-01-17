import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockBlastEngine } from '@/hooks/useBlockBlastEngine';
import { useHighScores } from '@/hooks/useHighScores';
import { BlockBlastGrid } from '@/components/game/BlockBlastGrid';
import { PieceTray } from '@/components/game/PieceTray';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import { ScorePopup } from '@/components/game/ScorePopup';
import { ElementLegend } from '@/components/game/ElementLegend';
import { LeaderboardModal } from '@/components/game/LeaderboardModal';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw } from 'lucide-react';
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);

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

  const handleCellHover = useCallback((pos: Position) => {
    if (gameState.selectedPiece && canPlacePiece(gameState.selectedPiece, pos)) {
      setDropPreview(pos);
    } else if (gameState.selectedPiece) {
      setDropPreview(pos);
    }
  }, [gameState.selectedPiece, canPlacePiece, setDropPreview]);

  const handleCellClick = useCallback((pos: Position) => {
    if (gameState.selectedPiece && canPlacePiece(gameState.selectedPiece, pos)) {
      placePiece(gameState.selectedPiece, pos);
    }
  }, [gameState.selectedPiece, canPlacePiece, placePiece]);

  const handleGridLeave = useCallback(() => {
    setDropPreview(null);
  }, [setDropPreview]);

  const hasStarted = gameState.availablePieces.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end text-white flex flex-col">
      {/* Floating leaderboard button */}
      <button
        onClick={() => setShowLeaderboard(true)}
        className="fixed top-4 right-4 z-30 p-2.5 rounded-full bg-game-grid-dark/80 border border-game-grid-border/50 hover:bg-game-grid-dark transition-colors"
        title="View High Scores"
      >
        <Trophy className="w-5 h-5 text-yellow-400" />
      </button>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        highScores={highScores}
        currentScore={gameState.isGameOver ? gameState.score : undefined}
        onClear={clearScores}
      />

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {/* Title - minimal */}
        <motion.h1 
          className="text-2xl sm:text-3xl font-black tracking-tight text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent">
            Elemental Blast
          </span>
        </motion.h1>

        {/* Score - prominent, floating */}
        {hasStarted && (
          <BlockBlastScoreboard 
            score={gameState.score} 
            topScore={topScore}
            compact
          />
        )}

        {/* Start screen */}
        {!hasStarted && (
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-game-text-muted text-sm text-center max-w-xs">
              Match elements • Clear lines • Chain reactions
            </p>
            <Button
              onClick={startGame}
              size="lg"
              className="bg-gradient-to-r from-game-accent to-emerald-400 hover:from-emerald-400 hover:to-game-accent text-black font-bold text-lg px-10 py-7 rounded-2xl shadow-lg shadow-game-accent/30 transition-all hover:scale-105"
            >
              <Play className="w-6 h-6 mr-2" />
              Play
            </Button>
          </motion.div>
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

            {/* Game over overlay */}
            <AnimatePresence>
              {gameState.isGameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-2xl z-20"
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center"
                  >
                    <p className="text-3xl font-black text-white mb-2">Game Over</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent mb-4">
                      {gameState.score.toLocaleString()}
                    </p>
                    <Button
                      onClick={startGame}
                      className="bg-gradient-to-r from-game-accent to-emerald-400 hover:from-emerald-400 hover:to-game-accent text-black font-bold px-6 py-5 rounded-xl"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
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

        {/* Element Legend - compact, below tray */}
        {hasStarted && (
          <div className="mt-2">
            <ElementLegend />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;