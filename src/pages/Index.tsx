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
import ReactionFeed from '@/components/game/ReactionFeed';
import ReactionTutorial from '@/components/game/ReactionTutorial';
import ReactionParticles from '@/components/game/ReactionParticles';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw, HelpCircle, Zap } from 'lucide-react';
import { Position } from '@/game/types';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const {
    gameState,
    shakeIntensity,
    comboDisplay,
    scorePopup,
    reactionPreviews,
    reactionEvents,
    reactionPreviewSummary,
    particleTrigger,
    startGame,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
  } = useBlockBlastEngine();

  const { highScores, topScore, saveScore, clearScores } = useHighScores();
  const hasGameEnded = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [showReactionFeed, setShowReactionFeed] = useState(false);
  const isMobile = useIsMobile();

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
      {/* Tutorial overlay - shows on first game */}
      {!tutorialComplete && (
        <ReactionTutorial onComplete={() => setTutorialComplete(true)} />
      )}

      {/* Floating buttons - top right */}
      <div className="fixed top-4 right-4 z-30 flex gap-2">
        {/* Reaction feed toggle (mobile) */}
        {isMobile && hasStarted && (
          <button
            onClick={() => setShowReactionFeed(!showReactionFeed)}
            className={`p-2.5 rounded-full border transition-colors ${
              showReactionFeed 
                ? 'bg-game-accent/20 border-game-accent/50' 
                : 'bg-game-grid-dark/80 border-game-grid-border/50 hover:bg-game-grid-dark'
            }`}
            title="View Reactions"
          >
            <Zap className={`w-5 h-5 ${showReactionFeed ? 'text-game-accent' : 'text-yellow-400'}`} />
          </button>
        )}
        
        {/* Leaderboard button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="p-2.5 rounded-full bg-game-grid-dark/80 border border-game-grid-border/50 hover:bg-game-grid-dark transition-colors"
          title="View High Scores"
        >
          <Trophy className="w-5 h-5 text-yellow-400" />
        </button>

        {/* Help button to replay tutorial */}
        <button
          onClick={() => {
            localStorage.removeItem('elemental-blast-tutorial-seen');
            setTutorialComplete(false);
          }}
          className="p-2.5 rounded-full bg-game-grid-dark/80 border border-game-grid-border/50 hover:bg-game-grid-dark transition-colors"
          title="How to Play"
        >
          <HelpCircle className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        highScores={highScores}
        currentScore={gameState.isGameOver ? gameState.score : undefined}
        onClear={clearScores}
      />

      {/* Main content wrapper */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="flex gap-6 items-start max-w-4xl w-full justify-center">
          {/* Main game column */}
          <div className="flex flex-col items-center gap-6">
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
                
                {/* Reaction Particles */}
                <ReactionParticles 
                  trigger={particleTrigger}
                  cellSize={44}
                  gridOffset={{ x: 12, y: 12 }}
                />
                
                {/* Score popup overlay */}
                <ScorePopup 
                  score={scorePopup.score} 
                  show={scorePopup.show} 
                  text={comboDisplay.text}
                  reactionType={scorePopup.reactionType}
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
          </div>

          {/* Reaction Feed Panel - Desktop only (always visible) or Mobile (toggleable) */}
          {hasStarted && (
            <AnimatePresence>
              {(!isMobile || showReactionFeed) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`
                    ${isMobile 
                      ? 'fixed top-20 right-4 z-40 w-52 bg-game-grid-dark/95 border border-game-grid-border/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm' 
                      : 'hidden lg:block w-48 bg-game-grid-dark/50 border border-game-grid-border/30 rounded-xl p-4'
                    }
                  `}
                >
                  <ReactionFeed 
                    reactions={reactionEvents}
                    preview={reactionPreviewSummary}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;