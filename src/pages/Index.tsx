import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockBlastEngine } from '@/hooks/useBlockBlastEngine';
import { useHighScores } from '@/hooks/useHighScores';
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { BlockBlastGrid } from '@/components/game/BlockBlastGrid';
import { PieceTray } from '@/components/game/PieceTray';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import { ScorePopup } from '@/components/game/ScorePopup';
import { ElementLegend } from '@/components/game/ElementLegend';
import { LeaderboardModal } from '@/components/game/LeaderboardModal';
import { PlayerNameModal } from '@/components/game/PlayerNameModal';
import { DailyChallengeModal } from '@/components/game/DailyChallengeModal';
import { ShareButtons } from '@/components/game/ShareButtons';
import { SoundSettings, SoundToggleButton } from '@/components/game/SoundSettings';
import { KeyboardHints } from '@/components/game/KeyboardHints';
import ReactionFeed from '@/components/game/ReactionFeed';
import ReactionTutorial from '@/components/game/ReactionTutorial';
import ReactionParticles from '@/components/game/ReactionParticles';
import ElementMascots from '@/components/game/ElementMascots';
import BackgroundDoodles from '@/components/game/BackgroundDoodles';
import GameTitle from '@/components/game/GameTitle';
import HeroBlockDisplay from '@/components/game/HeroBlockDisplay';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw, HelpCircle, Zap, Calendar } from 'lucide-react';
import { Position } from '@/game/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { playSound } from '@/game/sounds';

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
    isDailyChallenge,
    startGame,
    startDailyChallenge,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
  } = useBlockBlastEngine();

  const { highScores, topScore, saveScore, clearScores } = useHighScores();
  const { submitScore, getStoredPlayerName, storePlayerName } = useGlobalLeaderboard();
  const { submitDailyScore, getPlayerDailyScore } = useDailyChallenge();
  
  const hasGameEnded = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submittedPlayerName, setSubmittedPlayerName] = useState<string | null>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [playerDailyBest, setPlayerDailyBest] = useState<number | null>(null);
  const [tutorialComplete, setTutorialComplete] = useState(false);
  const [showReactionFeed, setShowReactionFeed] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const isMobile = useIsMobile();

  // Load player's daily best score when opening daily challenge modal
  useEffect(() => {
    const loadDailyBest = async () => {
      const playerName = getStoredPlayerName();
      if (playerName) {
        const best = await getPlayerDailyScore(playerName);
        setPlayerDailyBest(best);
      }
    };
    if (showDailyChallenge) {
      loadDailyBest();
    }
  }, [showDailyChallenge, getStoredPlayerName, getPlayerDailyScore]);

  // Save score when game ends and check for high score
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0 && !hasGameEnded.current) {
      hasGameEnded.current = true;
      const isHigh = gameState.score > topScore;
      setIsNewHighScore(isHigh);
      if (isHigh) {
        playSound('highScore');
      } else {
        playSound('gameOver');
      }
      
      // Save to local scores (for both regular and daily)
      if (!isDailyChallenge) {
        saveScore(gameState.score);
      }
      
      // Show player name modal for score submission if score is decent
      if (gameState.score >= 100) {
        setShowPlayerNameModal(true);
      }
    }
    if (!gameState.isGameOver) {
      hasGameEnded.current = false;
      setIsNewHighScore(false);
      setSubmittedPlayerName(null);
      setGlobalRank(null);
    }
  }, [gameState.isGameOver, gameState.score, saveScore, topScore, isDailyChallenge]);

  const handleSubmitScore = useCallback(async (playerName: string) => {
    setIsSubmittingScore(true);
    try {
      storePlayerName(playerName);
      
      if (isDailyChallenge) {
        // Submit to daily challenge leaderboard
        const result = await submitDailyScore(playerName, gameState.score);
        if (result.success) {
          setSubmittedPlayerName(playerName);
          setGlobalRank(result.rank || null);
          setShowPlayerNameModal(false);
          // Update player's daily best
          if (result.isNewBest) {
            setPlayerDailyBest(gameState.score);
          }
        }
      } else {
        // Submit to global leaderboard
        const result = await submitScore(playerName, gameState.score);
        if (result.success) {
          setSubmittedPlayerName(playerName);
          setGlobalRank(result.rank || null);
          setShowPlayerNameModal(false);
        }
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setIsSubmittingScore(false);
    }
  }, [gameState.score, isDailyChallenge, submitScore, submitDailyScore, storePlayerName]);

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
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end text-white flex flex-col relative">
      {/* Background decorations */}
      <BackgroundDoodles />
      
      {/* Element mascots - visible on start screen */}
      <AnimatePresence>
        {!hasStarted && <ElementMascots isPlaying={hasStarted} />}
      </AnimatePresence>

      {/* Tutorial overlay - shows on first game */}
      {!tutorialComplete && (
        <ReactionTutorial onComplete={() => setTutorialComplete(true)} />
      )}

      {/* Floating buttons - top right */}
      <div className="fixed top-4 right-4 z-30 flex gap-2">
        {/* Reaction feed toggle (mobile & tablet) */}
        {hasStarted && (
          <button
            onClick={() => setShowReactionFeed(!showReactionFeed)}
            className={`p-2.5 rounded-full border transition-colors lg:hidden ${
              showReactionFeed 
                ? 'bg-game-accent/20 border-game-accent/50' 
                : 'bg-game-grid-dark/80 border-game-grid-border/50 hover:bg-game-grid-dark'
            }`}
            title="View Reactions"
          >
            <Zap className={`w-5 h-5 ${showReactionFeed ? 'text-game-accent' : 'text-yellow-400'}`} />
          </button>
        )}
        
        {/* Sound Settings button */}
        <SoundToggleButton onClick={() => setShowSoundSettings(true)} />
        
        {/* Daily Challenge button */}
        <button
          onClick={() => setShowDailyChallenge(true)}
          className="p-2.5 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/50 hover:from-amber-500/30 hover:to-orange-500/30 transition-colors"
          title="Daily Challenge"
        >
          <Calendar className="w-5 h-5 text-amber-400" />
        </button>
        
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

      {/* Player Name Modal */}
      <PlayerNameModal
        isOpen={showPlayerNameModal}
        onClose={() => setShowPlayerNameModal(false)}
        onSubmit={handleSubmitScore}
        score={gameState.score}
        defaultName={getStoredPlayerName()}
        isSubmitting={isSubmittingScore}
      />

      {/* Sound Settings Modal */}
      <SoundSettings
        isOpen={showSoundSettings}
        onClose={() => setShowSoundSettings(false)}
      />

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        isOpen={showDailyChallenge}
        onClose={() => setShowDailyChallenge(false)}
        onStartChallenge={startDailyChallenge}
        playerBestScore={playerDailyBest}
        highlightPlayerName={getStoredPlayerName() || undefined}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        highScores={highScores}
        currentScore={gameState.isGameOver ? gameState.score : undefined}
        onClear={clearScores}
        highlightPlayerName={submittedPlayerName || undefined}
      />

      {/* Main content wrapper */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="flex gap-6 items-start max-w-4xl w-full justify-center">
          {/* Main game column */}
          <div className="flex flex-col items-center gap-6">
            {/* Title - Bold 3D style for start screen, minimal when playing */}
            {!hasStarted ? (
              <GameTitle />
            ) : (
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent">
                    Elemental Blast
                  </span>
                </h1>
                {/* Daily challenge indicator */}
                {isDailyChallenge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-1"
                  >
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-xs text-amber-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      Daily Challenge
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Score - prominent, floating */}
            {hasStarted && (
              <BlockBlastScoreboard 
                score={gameState.score} 
                topScore={isDailyChallenge ? (playerDailyBest || 0) : topScore}
                compact
              />
            )}

            {/* Start screen */}
            {!hasStarted && (
              <motion.div
                className="flex flex-col items-center gap-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {/* Hero blocks display */}
                <HeroBlockDisplay />
                
                <p className="text-white/60 text-sm text-center max-w-xs">
                  Match elements • Clear lines • Chain reactions
                </p>
                
                <div className="flex flex-col gap-3 items-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={startGame}
                      size="lg"
                      className="relative bg-gradient-to-b from-game-accent to-emerald-500 hover:from-emerald-400 hover:to-game-accent text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-[0_8px_32px_rgba(34,197,94,0.4)] transition-all"
                      style={{
                        boxShadow: '0 8px 32px rgba(34,197,94,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
                      }}
                    >
                      <Play className="w-7 h-7 mr-2 fill-current" />
                      PLAY
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => setShowDailyChallenge(true)}
                      variant="outline"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Daily Challenge
                    </Button>
                  </motion.div>
                </div>
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
                        {/* Daily Challenge badge */}
                        {isDailyChallenge && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-2"
                          >
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-full text-sm text-amber-400 font-medium">
                              <Calendar className="w-4 h-4" />
                              Daily Challenge
                            </span>
                          </motion.div>
                        )}
                        
                        {/* High Score Celebration */}
                        {isNewHighScore && !isDailyChallenge && (
                          <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                            className="mb-3"
                          >
                            <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black font-black text-sm rounded-full shadow-lg animate-pulse">
                              🏆 NEW HIGH SCORE! 🏆
                            </span>
                          </motion.div>
                        )}
                        
                        <p className="text-3xl font-black text-white mb-2">
                          {isNewHighScore && !isDailyChallenge ? 'Amazing!' : 'Game Over'}
                        </p>
                        <p className={`text-4xl font-black bg-clip-text text-transparent mb-2 ${
                          isNewHighScore && !isDailyChallenge
                            ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400' 
                            : isDailyChallenge
                              ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400'
                              : 'bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end'
                        }`}>
                          {gameState.score.toLocaleString()}
                        </p>
                        
                        {/* Global rank display */}
                        {globalRank && submittedPlayerName && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-2"
                          >
                            <span className="inline-block px-3 py-1 bg-game-accent/20 border border-game-accent/40 rounded-full text-sm">
                              <Trophy className="w-4 h-4 inline-block mr-1 text-yellow-400" />
                              <span className="text-white font-medium">
                                {isDailyChallenge ? "Today's Rank" : 'Global Rank'}: #{globalRank}
                              </span>
                            </span>
                          </motion.div>
                        )}
                        
                        {/* Social proof - percentile ranking (only for regular mode) */}
                        {!isDailyChallenge && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-game-text-muted mb-4"
                          >
                            {gameState.score >= 5000 
                              ? "🔥 Top 5% of players!" 
                              : gameState.score >= 2000 
                                ? "⭐ Top 25% of players!"
                                : gameState.score >= 1000 
                                  ? "👍 Top 50% of players!"
                                  : gameState.score >= 500 
                                    ? "Top 75% of players"
                                    : "Keep practicing!"}
                          </motion.p>
                        )}
                        
                        {/* Share buttons */}
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="mb-4"
                        >
                          <ShareButtons 
                            score={gameState.score} 
                            isDailyChallenge={isDailyChallenge}
                            rank={globalRank}
                          />
                        </motion.div>
                        
                        {/* Submit score button if not already submitted */}
                        {!submittedPlayerName && gameState.score >= 100 && (
                          <Button
                            onClick={() => setShowPlayerNameModal(true)}
                            variant="outline"
                            className="mb-3 border-game-accent/50 text-game-accent hover:bg-game-accent/10"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Submit to Leaderboard
                          </Button>
                        )}
                        
                        <div className="flex flex-col gap-2">
                          <Button
                            onClick={isDailyChallenge ? startDailyChallenge : startGame}
                            className="bg-gradient-to-r from-game-accent to-emerald-400 hover:from-emerald-400 hover:to-game-accent text-black font-bold px-6 py-5 rounded-xl"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Play Again
                          </Button>
                          
                          {isDailyChallenge && (
                            <Button
                              onClick={startGame}
                              variant="ghost"
                              className="text-game-text-muted hover:text-white"
                            >
                              Play Regular Mode
                            </Button>
                          )}
                        </div>
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

            {/* Element Legend - Tablet/Mobile only (below tray) */}
            {hasStarted && (
              <div className="mt-2 lg:hidden">
                <ElementLegend />
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop only */}
          {hasStarted && (
            <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-48 sticky top-24 self-start max-h-[calc(100vh-8rem)]">
              {/* Reaction Feed Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-game-grid-dark/50 border border-game-grid-border/30 rounded-xl p-4 overflow-y-auto max-h-[50vh]"
              >
                <ReactionFeed 
                  reactions={reactionEvents}
                  preview={reactionPreviewSummary}
                />
              </motion.div>
              
              {/* Element Legend Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-game-grid-dark/50 border border-game-grid-border/30 rounded-xl p-4"
              >
                <ElementLegend variant="vertical" />
              </motion.div>
            </div>
          )}

          {/* Tablet/Mobile: Toggleable Reaction Feed overlay */}
          <AnimatePresence>
            {showReactionFeed && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="lg:hidden fixed top-20 right-4 z-40 w-52 md:w-56 bg-game-grid-dark/95 backdrop-blur-md border border-game-grid-border/50 rounded-xl p-4 shadow-2xl"
              >
                <button
                  onClick={() => setShowReactionFeed(false)}
                  className="absolute top-2 right-2 text-white/40 hover:text-white/80 transition-colors"
                >
                  ✕
                </button>
                <ReactionFeed 
                  reactions={reactionEvents}
                  preview={reactionPreviewSummary}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Keyboard Hints - Desktop only */}
      {hasStarted && <KeyboardHints />}
    </div>
  );
};

export default Index;
