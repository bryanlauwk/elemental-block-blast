import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlockBlastEngine } from '@/hooks/useBlockBlastEngine';
import { useHighScores } from '@/hooks/useHighScores';
import { useGlobalLeaderboard } from '@/hooks/useGlobalLeaderboard';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useDailyStreak } from '@/hooks/useDailyStreak';
import { useAchievements } from '@/hooks/useAchievements';
import { BlockBlastGrid } from '@/components/game/BlockBlastGrid';
import { PieceTray } from '@/components/game/PieceTray';
import { BlockBlastScoreboard } from '@/components/game/BlockBlastScoreboard';
import { ScorePopup } from '@/components/game/ScorePopup';
import { ElementLegend } from '@/components/game/ElementLegend';
import { LeaderboardModal } from '@/components/game/LeaderboardModal';
import { PlayerNameModal } from '@/components/game/PlayerNameModal';
import { DailyChallengeModal } from '@/components/game/DailyChallengeModal';
import { ShareButtons } from '@/components/game/ShareButtons';
import { SoundSettings } from '@/components/game/SoundSettings';
import { KeyboardHints } from '@/components/game/KeyboardHints';
import { ExitConfirmModal } from '@/components/game/ExitConfirmModal';
import { StreakBadge } from '@/components/game/StreakBadge';
import { AchievementPopup } from '@/components/game/AchievementPopup';
import { AchievementsModal } from '@/components/game/AchievementsModal';
import { MobileMenu } from '@/components/game/MobileMenu';
import ReactionFeed from '@/components/game/ReactionFeed';
import ReactionTutorial from '@/components/game/ReactionTutorial';
import ReactionParticles from '@/components/game/ReactionParticles';

import GameTitle from '@/components/game/GameTitle';
import HeroBlockDisplay from '@/components/game/HeroBlockDisplay';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw, HelpCircle, Zap, Calendar, Volume2, Home, Award } from 'lucide-react';
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
    resetGame,
    selectPiece,
    setDropPreview,
    canPlacePiece,
    placePiece,
  } = useBlockBlastEngine();

  const { highScores, topScore, saveScore, clearScores } = useHighScores();
  const { submitScore, getStoredPlayerName, storePlayerName } = useGlobalLeaderboard();
  const { submitDailyScore, getPlayerDailyScore } = useDailyChallenge();
  const { currentStreak, playedToday, recordPlay, isStreakAtRisk } = useDailyStreak();
  const { achievements, totalPoints, justUnlocked, checkAchievements, clearJustUnlocked } = useAchievements();
  
  const hasGameEnded = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
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
      
      // Record streak play
      recordPlay();
      
      // Check achievements
      checkAchievements({ score: gameState.score, streak: currentStreak });
      if (isDailyChallenge) {
        checkAchievements({ dailyChallengesCompleted: 1 });
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
  }, [gameState.isGameOver, gameState.score, saveScore, topScore, isDailyChallenge, recordPlay, checkAchievements, currentStreak]);

  // Check achievements when combo/reactions happen
  useEffect(() => {
    if (comboDisplay.show && comboDisplay.count > 0) {
      checkAchievements({ combo: comboDisplay.count });
    }
  }, [comboDisplay.show, comboDisplay.count, checkAchievements]);

  // Check achievements on reaction events
  useEffect(() => {
    if (reactionEvents.length > 0) {
      const lastEvent = reactionEvents[reactionEvents.length - 1];
      checkAchievements({ reactionType: lastEvent.type, reactionCount: 1 });
    }
  }, [reactionEvents, checkAchievements]);

  // Handle exit game
  const handleExitGame = useCallback(() => {
    setShowExitModal(false);
    resetGame();
  }, [resetGame]);
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
    if (gameState.selectedPiece) {
      setDropPreview(pos);
    }
  }, [gameState.selectedPiece, setDropPreview]);

  const handleCellClick = useCallback((pos: Position) => {
    if (gameState.selectedPiece && canPlacePiece(gameState.selectedPiece, pos)) {
      placePiece(gameState.selectedPiece, pos);
    }
  }, [gameState.selectedPiece, canPlacePiece, placePiece]);

  const handleGridLeave = useCallback(() => {
    setDropPreview(null);
  }, [setDropPreview]);

  const hasStarted = gameState.availablePieces.length > 0;

  // Glassmorphism icon button style - mobile optimized
  const iconButtonClass = "w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95";
  const iconButtonStyle = {
    background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.9), rgba(15, 23, 42, 0.95))',
    boxShadow: '0 4px 0 rgba(6, 182, 212, 0.3), 0 6px 15px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)',
    border: '1px solid rgba(34, 211, 238, 0.4)',
  };

  return (
    <div className="min-h-[100dvh] text-white flex flex-col relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 20%, hsl(220 75% 45%) 0%, hsl(225 80% 32%) 40%, hsl(230 85% 22%) 100%)',
      }}
    >
      {/* Grid pattern overlay - arcade style with white lines */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Perspective floor grid - classic arcade depth effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[40vh] pointer-events-none overflow-hidden"
        style={{
          perspective: '500px',
          perspectiveOrigin: '50% 0%',
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            transform: 'rotateX(75deg)',
            transformOrigin: 'top center',
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.2) 2px, transparent 2px),
              linear-gradient(90deg, rgba(255,255,255,0.2) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }}
        />
        {/* Horizon glow line */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.6) 30%, rgba(255,100,200,0.6) 70%, transparent 100%)',
            boxShadow: '0 0 30px rgba(0,229,255,0.5), 0 0 60px rgba(255,100,200,0.3)',
          }}
        />
      </div>
      
      {/* Subtle spotlight glow behind hero area */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 35%, rgba(100,150,255,0.25) 0%, transparent 70%)',
        }}
      />

      {/* Tutorial overlay - shows on first game */}
      {!tutorialComplete && (
        <ReactionTutorial onComplete={() => setTutorialComplete(true)} />
      )}

      {/* Top bar - text logo left, icons right */}
      <div className="fixed top-4 left-4 right-4 z-30 flex justify-between items-center">
        {/* Left: Text Logo */}
        <a 
          href="https://www.bryanlauwk.fun" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-bold tracking-tight text-white hover:text-cyan-300 transition-colors"
          style={{
            fontFamily: "'Bebas Neue', 'Anton', sans-serif",
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            letterSpacing: '-0.02em',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          BRYANLAUWK.FUN
        </a>
        
        {/* Right: Icons - Desktop shows all, Mobile shows hamburger */}
        <div className="flex gap-2 items-center">
          {/* Exit/Home button - only during gameplay */}
          {hasStarted && !gameState.isGameOver && (
            <button
              onClick={() => setShowExitModal(true)}
              className={iconButtonClass}
              style={iconButtonStyle}
              title="Exit Game"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
          )}
          
          {/* Mobile: Hamburger Menu */}
          {isMobile && (
            <MobileMenu
              onOpenSoundSettings={() => setShowSoundSettings(true)}
              onOpenDailyChallenge={() => setShowDailyChallenge(true)}
              onOpenAchievements={() => setShowAchievements(true)}
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenTutorial={() => {
                localStorage.removeItem('elemental-blast-tutorial-seen');
                setTutorialComplete(false);
              }}
              onToggleReactionFeed={() => setShowReactionFeed(!showReactionFeed)}
              showReactionFeedToggle={hasStarted}
              reactionFeedActive={showReactionFeed}
              currentStreak={currentStreak}
              isStreakAtRisk={isStreakAtRisk}
            />
          )}
          
          {/* Desktop: Full icon bar */}
          {!isMobile && (
            <>
              {/* Sound Settings button */}
              <button
                onClick={() => setShowSoundSettings(true)}
                className={iconButtonClass}
                style={iconButtonStyle}
                title="Sound Settings"
              >
                <Volume2 className="w-5 h-5 text-white" />
              </button>
              
              {/* Daily Challenge button */}
              <button
                onClick={() => setShowDailyChallenge(true)}
                className={iconButtonClass}
                style={iconButtonStyle}
                title="Daily Challenge"
              >
                <Calendar className="w-5 h-5 text-white" />
              </button>
              
              {/* Streak badge */}
              {currentStreak > 0 && (
                <StreakBadge streak={currentStreak} isAtRisk={isStreakAtRisk} size="md" />
              )}
              
              {/* Reaction feed toggle (tablet) */}
              {hasStarted && (
                <button
                  onClick={() => setShowReactionFeed(!showReactionFeed)}
                  className={`${iconButtonClass} lg:hidden`}
                  style={iconButtonStyle}
                  title="View Reactions"
                >
                  <Zap className={`w-5 h-5 ${showReactionFeed ? 'text-game-accent' : 'text-yellow-400'}`} />
                </button>
              )}
              
              {/* Achievements button */}
              <button
                onClick={() => setShowAchievements(true)}
                className={iconButtonClass}
                style={iconButtonStyle}
                title="Achievements"
              >
                <Award className="w-5 h-5 text-amber-400" />
              </button>
              
              {/* Leaderboard button */}
              <button
                onClick={() => setShowLeaderboard(true)}
                className={iconButtonClass}
                style={iconButtonStyle}
                title="View High Scores"
              >
                <Trophy className="w-5 h-5" fill="#FBBF24" stroke="#F59E0B" />
              </button>

              {/* Help button */}
              <button
                onClick={() => {
                  localStorage.removeItem('elemental-blast-tutorial-seen');
                  setTutorialComplete(false);
                }}
                className={iconButtonClass}
                style={iconButtonStyle}
                title="How to Play"
              >
                <HelpCircle className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>
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

      {/* Exit Confirm Modal */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={handleExitGame}
        currentScore={gameState.score}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements}
        totalPoints={totalPoints}
      />

      {/* Achievement Popup */}
      <AchievementPopup
        achievement={justUnlocked}
        onDismiss={clearJustUnlocked}
      />

      {/* Main content wrapper - proper spacing zones */}
      <main className="flex-1 flex flex-col items-center justify-between px-3 sm:px-4 py-4 sm:py-6 pt-16 sm:pt-20 md:pt-24 min-h-[calc(100dvh-60px)]">
        <div className="flex gap-4 sm:gap-6 items-start max-w-4xl w-full justify-center flex-1">
          {/* Main game column */}
          <div className="flex flex-col items-center w-full max-w-[400px] h-full">
            {/* Start screen - landing page */}
            {!hasStarted && (
              <div className="flex flex-col items-center justify-center flex-1 gap-4 sm:gap-6 md:gap-8 py-2 sm:py-4">
                {/* Title Section - unified logo */}
                <GameTitle />
                
                {/* Hero Section with CTA - closer to title */}
                <HeroBlockDisplay>
                  {/* Play button - HUGE vibrant green arcade style */}
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="relative bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 text-white font-black text-xl sm:text-2xl md:text-3xl px-12 sm:px-16 md:px-20 py-4 sm:py-5 md:py-6 rounded-full transition-all overflow-hidden border-0 active:translate-y-1 active:shadow-none"
                    style={{
                      boxShadow: '0 6px 0 #047857, 0 10px 30px rgba(16,185,129,0.5), inset 0 3px 8px rgba(255,255,255,0.5)',
                      animation: 'pulse-glow 2s ease-in-out infinite',
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full" />
                    <span className="relative z-10 tracking-widest drop-shadow-lg">PLAY</span>
                  </Button>
                  
                  {/* Daily Challenge button - subtle text link style */}
                  <button
                    onClick={() => setShowDailyChallenge(true)}
                    className="flex items-center gap-2 text-amber-400/80 hover:text-amber-300 font-medium text-xs sm:text-sm md:text-base transition-colors mt-1 sm:mt-2"
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Daily Challenge</span>
                  </button>
                </HeroBlockDisplay>
              </div>
            )}
            
            {/* Game screen - when playing */}
            {hasStarted && (
              <>
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-game-score-start via-game-score-mid to-game-score-end bg-clip-text text-transparent">
                      Elemental Block Blast
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

                {/* Score - prominent, floating */}
                <BlockBlastScoreboard 
                  score={gameState.score} 
                  topScore={isDailyChallenge ? (playerDailyBest || 0) : topScore}
                  compact
                />

                {/* Game Grid */}
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
              </>
            )}
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
