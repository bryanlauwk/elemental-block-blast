import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
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
import MarqueeRibbon from '@/components/game/MarqueeRibbon';

import GameTitle from '@/components/game/GameTitle';
import HeroBlockDisplay from '@/components/game/HeroBlockDisplay';
import LottieBurst from '@/components/game/LottieBurst';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw, HelpCircle, Zap, Calendar, Volume2, Home, Award, Flame, Droplets, TreeDeciduous, Mountain, Wind, Lightbulb } from 'lucide-react';
import { PixarChip, PixarButton, PixarStatChip, PixarBadge, PixarOverlay } from '@/components/game/pixar';
import { Position } from '@/game/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { playSound, startMusic } from '@/game/sounds';
import { usePhase } from '@/hooks/usePhase';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import PhasePill from '@/components/game/PhasePill';
import PhaseUpOverlay from '@/components/game/PhaseUpOverlay';
import heroMascot from '@/assets/hero-mascot.png';

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
    findHint,
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
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const isMobile = useIsMobile();

  // Phase progression (drives adaptive stage + HUD pill + phase-up celebration)
  const { phase, next, progress, justAdvanced, clearJustAdvanced } = usePhase(gameState.score);

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

  // Celebratory Lottie bursts: confetti on level-up + new high score,
  // sparkles on satisfying combos.
  useEffect(() => {
    if (justAdvanced) setConfettiTrigger((t) => t + 1);
  }, [justAdvanced]);

  useEffect(() => {
    // Celebrate a new high score, or simply finishing a daily challenge.
    if (gameState.isGameOver && gameState.score > 0 && (isNewHighScore || isDailyChallenge)) {
      setConfettiTrigger((t) => t + 1);
    }
  }, [gameState.isGameOver, gameState.score, isNewHighScore, isDailyChallenge]);

  useEffect(() => {
    if (comboDisplay.show && comboDisplay.count >= 2) {
      setSparkleTrigger((t) => t + 1);
    }
  }, [comboDisplay.show, comboDisplay.count]);

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

  // "Hint" — ghost a helpful placement on the board for a moment.
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleHint = useCallback(() => {
    const hint = findHint();
    if (!hint) return;
    playSound('select');
    selectPiece(hint.piece);
    setDropPreview(hint.pos);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setDropPreview(null), 1800);
  }, [findHint, selectPiece, setDropPreview]);

  useEffect(() => () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
  }, []);

  // Kick off the ambient soundtrack on the Play gesture so the game has music
  // from the very start (respects the saved music setting via startMusic()).
  const handleStartGame = useCallback(() => {
    startMusic();
    startGame();
  }, [startGame]);
  const handleStartDaily = useCallback(() => {
    startMusic();
    startDailyChallenge();
  }, [startDailyChallenge]);

  const hasStarted = gameState.availablePieces.length > 0;


  return (
    <div
      className="min-h-[100dvh] text-white flex flex-col relative overflow-hidden bg-gradient-pixar-stage"
      style={{
        // Drive per-universe theming (grid frame, accent line) from the
        // current phase so the whole board travels through worlds, not just
        // the backdrop.
        ['--stage-accent' as string]: phase.accent,
        ['--stage-glow' as string]: phase.glow,
      } as CSSProperties}
    >
      {/* Pixar Toy Box gameplay overlays */}
      {hasStarted && (
      <AdaptiveStage phase={phase} />
      )}

      {/* Phase-up celebration */}
      <PhaseUpOverlay phase={justAdvanced} onDone={clearJustAdvanced} />

      {/* Celebratory Lottie bursts (confetti on level-up/high score, sparkles on combos) */}
      <LottieBurst type="confetti" trigger={confettiTrigger} className="fixed" />
      <LottieBurst type="sparkle" trigger={sparkleTrigger} className="fixed" />

      {/* Pixar soft cloud glow — landing only */}
      {!hasStarted && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 28%, hsl(var(--pixar-blue) / 0.15) 0%, transparent 70%)',
          }}
        />
      )}

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
            <PixarChip onClick={() => setShowExitModal(true)} title="Exit Game">
              <Home className="w-5 h-5 text-white" />
            </PixarChip>
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
              <PixarChip onClick={() => setShowSoundSettings(true)} title="Sound Settings">
                <Volume2 className="w-5 h-5 text-white" />
              </PixarChip>
              
              {/* Daily Challenge button */}
              <PixarChip onClick={() => setShowDailyChallenge(true)} title="Daily Challenge">
                <Calendar className="w-5 h-5 text-pixar-yellow" />
              </PixarChip>
              
              {/* Streak badge */}
              {currentStreak > 0 && (
                <StreakBadge streak={currentStreak} isAtRisk={isStreakAtRisk} size="md" />
              )}
              
              {/* Reaction feed toggle (tablet) */}
              {hasStarted && (
                <PixarChip
                  onClick={() => setShowReactionFeed(!showReactionFeed)}
                  className="lg:hidden"
                  active={showReactionFeed}
                  title="View Reactions"
                >
                  <Zap className={`w-5 h-5 ${showReactionFeed ? 'text-pixar-yellow' : 'text-white'}`} />
                </PixarChip>
              )}
              
              {/* Achievements button */}
              <PixarChip onClick={() => setShowAchievements(true)} title="Achievements">
                <Award className="w-5 h-5 text-pixar-yellow" />
              </PixarChip>
              
              {/* Leaderboard button */}
              <PixarChip onClick={() => setShowLeaderboard(true)} title="View High Scores">
                <Trophy className="w-5 h-5" fill="hsl(var(--pixar-yellow))" stroke="hsl(var(--pixar-yellow-deep))" />
              </PixarChip>

              {/* Help button */}
              <PixarChip
                onClick={() => {
                  localStorage.removeItem('elemental-blast-tutorial-seen');
                  setTutorialComplete(false);
                }}
                title="How to Play"
              >
                <HelpCircle className="w-5 h-5 text-white" />
              </PixarChip>
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
        onStartChallenge={handleStartDaily}
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
              <div className="flex flex-col items-center justify-center flex-1 gap-5 sm:gap-7 py-4 sm:py-6 w-full">
                {/* Pixar stat chips — above title */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.4 }}
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                >
                  <PixarStatChip label="Best" value={topScore.toLocaleString()} tone="blue" />
                  <PixarStatChip label="Streak" value={currentStreak} tone="yellow" />
                  <PixarStatChip label="XP" value={totalPoints.toLocaleString()} tone="neutral" />
                </motion.div>

                {/* Pixar 3D Headline + playful tagline */}
                <div className="flex flex-col items-center gap-1.5">
                  <GameTitle />
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-center text-pixar-blue/90 font-bold text-[10px] sm:text-xs uppercase tracking-[0.22em]"
                    style={{ fontFamily: 'Cabin, system-ui, sans-serif' }}
                  >
                    Spark reactions · Blast lines · Explore worlds
                  </motion.p>
                </div>

                {/* Pixar mascot + floating props */}
                <div className="relative w-full flex items-center justify-center pointer-events-none">
                  {/* Floating decorative props */}
                  <span
                    aria-hidden
                    className="hero-prop absolute left-[8%] top-2 w-8 h-8 rounded-lg shadow-lg"
                    style={{
                      background: 'linear-gradient(180deg, hsl(var(--pixar-yellow)), hsl(var(--pixar-yellow-deep)))',
                      boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5), 0 4px 0 hsl(var(--pixar-yellow-deep))',
                      animationDelay: '0.4s',
                    }}
                  />
                  <span
                    aria-hidden
                    className="hero-prop absolute right-[10%] top-8 w-6 h-6 rounded-md"
                    style={{
                      background: 'linear-gradient(180deg, hsl(var(--pixar-blue)), hsl(var(--pixar-blue-deep)))',
                      boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.5), 0 3px 0 hsl(var(--pixar-blue-deep))',
                      animationDelay: '1.1s',
                    }}
                  />
                  <span
                    aria-hidden
                    className="hero-prop absolute left-[18%] bottom-2 w-4 h-4 rounded-sm"
                    style={{
                      background: 'linear-gradient(180deg, hsl(var(--pixar-red)), hsl(var(--pixar-red-deep)))',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 0 hsl(var(--pixar-red-deep))',
                      animationDelay: '1.8s',
                    }}
                  />
                  <motion.img
                    src={heroMascot}
                    alt="Elemental Block Blast mascot — a stack of toy blocks with a flame and a star"
                    width={1024}
                    height={1536}
                    initial={{ opacity: 0, scale: 0.7, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 220, damping: 18 }}
                    className="mascot-bob relative z-10 w-24 sm:w-28 md:w-32 h-auto pointer-events-auto select-none drop-shadow-[0_16px_26px_rgba(0,0,0,0.45)]"
                    draggable={false}
                  />
                </div>

                {/* Element rubber-tile row */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="flex items-center justify-center gap-3 sm:gap-4"
                >
                  {[
                    { Icon: Flame, bg: 'bg-pixar-red', shadow: 'border-pixar-red-deep', iconColor: 'text-white' },
                    { Icon: Droplets, bg: 'bg-pixar-blue', shadow: 'border-pixar-blue-deep', iconColor: 'text-white' },
                    { Icon: TreeDeciduous, bg: 'bg-[hsl(140_55%_40%)]', shadow: 'border-[hsl(140_60%_22%)]', iconColor: 'text-white' },
                    { Icon: Mountain, bg: 'bg-slate-400', shadow: 'border-slate-700', iconColor: 'text-white' },
                    { Icon: Wind, bg: 'bg-pixar-yellow', shadow: 'border-pixar-yellow-deep', iconColor: 'text-pixar-navy-deep' },
                  ].map(({ Icon, bg, shadow, iconColor }, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -4 }}
                      whileTap={{ y: 2 }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 ${bg} ${shadow} border-b-[6px] rounded-2xl flex items-center justify-center cursor-pointer transition-shadow`}
                      style={{
                        boxShadow:
                          'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.35)',
                      }}
                    >
                      <Icon className={`w-7 h-7 sm:w-8 sm:h-8 ${iconColor}`} strokeWidth={2.5} />
                      {/* Glossy highlight */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute top-1.5 left-2 right-2 h-2 rounded-full bg-gradient-to-b from-white/55 to-transparent"
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pixar PLAY button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, type: 'spring', stiffness: 320, damping: 18 }}
                  className="relative inline-block"
                >
                  <PixarButton onClick={handleStartGame} aria-label="Play" variant="primary" size="lg" shine>
                    Play
                  </PixarButton>
                </motion.div>

                {/* Daily Challenge subtle link */}
                <button
                  onClick={() => setShowDailyChallenge(true)}
                  className="flex items-center gap-2 text-pixar-yellow/80 hover:text-pixar-yellow font-bold text-xs sm:text-sm uppercase tracking-widest transition-colors"
                  style={{ fontFamily: 'Cabin, system-ui, sans-serif' }}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Daily Challenge</span>
                </button>
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
                      <PixarBadge tone="yellow" icon={<Calendar className="w-3 h-3" />}>
                        Daily Challenge
                      </PixarBadge>
                    </motion.div>
                  )}
                </motion.div>

                {/* Score - prominent, floating */}
                <BlockBlastScoreboard 
                  score={gameState.score} 
                  topScore={isDailyChallenge ? (playerDailyBest || 0) : topScore}
                  compact
                />

                {/* Phase progress indicator */}
                <PhasePill phase={phase} next={next} progress={progress} />

                {/* Hint — ghosts a helpful placement (works on desktop & mobile) */}
                {!gameState.isGameOver && (
                  <button
                    onClick={handleHint}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-game-tray/60 border border-game-grid-border/30 text-xs font-bold text-game-text-muted hover:text-white hover:border-pixar-yellow/50 active:scale-95 transition-all"
                    title="Show a helpful move"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-pixar-yellow" />
                    Hint
                  </button>
                )}

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
                    <PixarOverlay>
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
                            <PixarBadge tone="yellow" icon={<Calendar className="w-4 h-4" />}>
                              Daily Challenge
                            </PixarBadge>
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
                            <PixarBadge tone="yellow" className="text-sm animate-pulse">
                              🏆 New High Score! 🏆
                            </PixarBadge>
                          </motion.div>
                        )}
                        
                        {/* Mascot reaction */}
                        <motion.img
                          src={heroMascot}
                          alt=""
                          initial={{ scale: 0.6, opacity: 0, y: 10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                          className="mascot-bob w-20 sm:w-24 h-auto mx-auto mb-1 select-none pointer-events-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
                          draggable={false}
                        />

                        <p className="text-3xl font-display text-white mb-2 tracking-wide">
                          {isNewHighScore && !isDailyChallenge
                            ? 'Amazing!'
                            : isDailyChallenge
                              ? 'Daily Done!'
                              : gameState.score >= 2000
                                ? 'Great run!'
                                : gameState.score >= 1000
                                  ? 'Nice run!'
                                  : 'Good game!'}
                        </p>
                        <p className={`text-5xl font-display bg-clip-text text-transparent mb-2 ${
                          isNewHighScore && !isDailyChallenge
                            ? 'bg-gradient-to-r from-pixar-yellow via-white to-pixar-red'
                            : 'bg-gradient-to-r from-pixar-yellow to-pixar-red'
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
                            <PixarBadge tone="blue" icon={<Trophy className="w-4 h-4" />}>
                              {isDailyChallenge ? "Today's Rank" : 'Global Rank'}: #{globalRank}
                            </PixarBadge>
                          </motion.div>
                        )}
                        
                        {/* Social proof - percentile ranking (only for regular mode) */}
                        {!isDailyChallenge && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-white/70 font-sans mb-4"
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
                          <div className="mb-3">
                            <PixarButton
                              onClick={() => setShowPlayerNameModal(true)}
                              variant="ghost"
                              size="sm"
                            >
                              Submit Score
                            </PixarButton>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center gap-3">
                          <PixarButton
                            onClick={isDailyChallenge ? handleStartDaily : handleStartGame}
                            variant="primary"
                            size="md"
                          shine
                          >
                            Play Again
                          </PixarButton>

                          {isDailyChallenge && (
                            <PixarButton onClick={handleStartGame} variant="ghost" size="sm">
                              Regular Mode
                            </PixarButton>
                          )}
                        </div>
                      </motion.div>
                    </PixarOverlay>
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
