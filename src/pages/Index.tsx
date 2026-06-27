import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
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
import { FeverMeter } from '@/components/game/FeverMeter';
import { BombMeter } from '@/components/game/BombMeter';
import { Button } from '@/components/ui/button';
import { Trophy, Play, RotateCcw, HelpCircle, Zap, Calendar, Volume2, Home, Award, Flame, Droplets, TreeDeciduous, Mountain, Wind, Lightbulb } from 'lucide-react';
import { PixarChip, PixarButton, PixarStatChip, PixarBadge, PixarOverlay } from '@/components/game/pixar';
import { Position, DraggablePiece, GRID_WIDTH, GRID_HEIGHT } from '@/game/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { playSound, startMusic } from '@/game/sounds';
import { usePhase } from '@/hooks/usePhase';
import AdaptiveStage from '@/components/game/AdaptiveStage';
import PhasePill from '@/components/game/PhasePill';
import PhaseUpOverlay from '@/components/game/PhaseUpOverlay';
import LofiAlleyBackdrop from '@/components/game/LofiAlleyBackdrop';
import HeroAlleyCat from '@/components/game/HeroAlleyCat';
import HeroPhaseTint from '@/components/game/HeroPhaseTint';
import sitCatAsset from '@/assets/alley-cat-sit.png.asset.json';

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
    perfectClearSignal,
    feverMeter,
    feverActive,
    feverEndsAt,
    rerollPiece,
    rerollAvailable,
    boardFillRatio,
    bombChance,
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
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [showReactionFeed, setShowReactionFeed] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const isMobile = useIsMobile();

  // Phase progression (drives adaptive stage + HUD pill + phase-up celebration)
  const { phase, next, progress, justAdvanced, clearJustAdvanced } = usePhase(gameState.score);

  // Brief "sharpen + brighten" pulse on the alley backdrop when a phase unlocks.
  const [backdropPulse, setBackdropPulse] = useState(false);
  useEffect(() => {
    if (!justAdvanced) return;
    setBackdropPulse(true);
    const t = setTimeout(() => setBackdropPulse(false), 900);
    return () => clearTimeout(t);
  }, [justAdvanced]);

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

  // Perfect Clear → full confetti celebration.
  useEffect(() => {
    if (perfectClearSignal > 0) setConfettiTrigger((t) => t + 1);
  }, [perfectClearSignal]);

  // Cube-spin the board when advancing to a new universe (transient flourish).
  const boardFlip = useAnimationControls();
  useEffect(() => {
    if (!justAdvanced) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    boardFlip.start({ rotateY: [0, 360], transition: { duration: 0.85, ease: 'easeInOut' } });
  }, [justAdvanced, boardFlip]);

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

  // Map a screen point to a board cell (used by tray drag-and-drop). On touch
  // the target is lifted ~1.1 cells above the finger so it isn't hidden.
  const cellFromPoint = useCallback((clientX: number, clientY: number, pointerType: string): Position | null => {
    const el = document.getElementById('bb-grid');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cellW = rect.width / GRID_WIDTH;
    const cellH = rect.height / GRID_HEIGHT;
    const offsetY = pointerType === 'mouse' ? 0 : cellH * 1.1;
    if (
      clientX < rect.left - cellW * 0.5 ||
      clientX > rect.right + cellW * 0.5 ||
      clientY < rect.top ||
      clientY > rect.bottom + offsetY
    ) return null;
    const x = Math.min(GRID_WIDTH - 1, Math.max(0, Math.floor((clientX - rect.left) / cellW)));
    const y = Math.min(GRID_HEIGHT - 1, Math.max(0, Math.floor((clientY - rect.top - offsetY) / cellH)));
    return { x, y };
  }, []);

  const handleDragHover = useCallback((_piece: DraggablePiece, clientX: number, clientY: number, pointerType: string) => {
    setDropPreview(cellFromPoint(clientX, clientY, pointerType));
  }, [cellFromPoint, setDropPreview]);

  const handleDragDrop = useCallback((piece: DraggablePiece, clientX: number, clientY: number, pointerType: string) => {
    const cell = cellFromPoint(clientX, clientY, pointerType);
    if (cell && canPlacePiece(piece, cell)) placePiece(piece, cell);
    setDropPreview(null);
  }, [cellFromPoint, canPlacePiece, placePiece, setDropPreview]);

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
      className="min-h-[100dvh] text-white flex flex-col relative overflow-hidden bg-transparent"
      style={{
        // Drive per-universe theming (grid frame, accent line) from the
        // current phase so the whole board travels through worlds, not just
        // the backdrop.
        ['--stage-accent' as string]: phase.accent,
        ['--stage-glow' as string]: phase.glow,
      } as CSSProperties}
    >
      {/* Lo-fi neon alley atmosphere layer — sits behind everything */}
      <LofiAlleyBackdrop blurred={false} pulse={backdropPulse} />

      {/* Pixar Toy Box gameplay overlays */}
      {hasStarted && (
      <AdaptiveStage phase={phase} />
      )}

      {/* Phase-up celebration */}
      <PhaseUpOverlay phase={justAdvanced} onDone={clearJustAdvanced} />

      {/* Celebratory Lottie bursts (confetti on level-up/high score, sparkles on combos) */}
      <LottieBurst type="confetti" trigger={confettiTrigger} className="fixed" />
      <LottieBurst type="sparkle" trigger={sparkleTrigger} className="fixed" />

      {/* Reaction Fever overdrive glow */}
      {feverActive && (
        <motion.div
          aria-hidden
          className="fixed inset-0 z-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            background:
              'radial-gradient(ellipse 90% 60% at 50% 100%, hsl(var(--pixar-red) / 0.28) 0%, transparent 70%)',
          }}
        />
      )}

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

      {/* Tutorial overlay — only opens on explicit user request (Help / menu). */}
      {tutorialOpen && (
        <ReactionTutorial
          forceOpen
          onComplete={() => setTutorialOpen(false)}
        />
      )}

      {/* Top bar - text logo left, icons right */}
      <div className="fixed top-4 left-4 right-4 z-30 flex justify-between items-center">
        {/* Left: Text Logo */}
        <a 
          href="https://www.bryanlauwk.fun" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ui-label-sm text-white/85 hover:text-cyan-300 transition-colors"
          style={{ textShadow: '0 0 12px hsl(190 95% 60% / 0.35)' }}
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
              onOpenTutorial={() => setTutorialOpen(true)}
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
                onClick={() => setTutorialOpen(true)}
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
      <main className="flex-1 flex flex-col items-center justify-between px-3 sm:px-4 py-2 sm:py-6 pt-14 sm:pt-20 md:pt-24 min-h-[calc(100dvh-60px)]">
        <div className="flex gap-4 sm:gap-6 items-start max-w-4xl w-full justify-center flex-1">
          {/* Main game column */}
          <div className="flex flex-col items-center w-full max-w-[400px] h-full">
            {/* Start screen - landing page */}
            {!hasStarted && (
              <motion.div
                className="flex flex-col items-center justify-center flex-1 gap-5 sm:gap-7 py-4 sm:py-6 w-full"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
                }}
              >
                {/* HERO: mascot + title locked together as one composition.
                    Mascot sits behind/beside the headline so they read as a
                    single unit rather than two stacked blocks. */}
                <motion.div
                  className="relative w-full flex items-center justify-center"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
                  }}
                >
                  {/* Soft glow halo anchoring mascot + title to the same plane */}
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 -z-0 mx-auto max-w-[420px] rounded-[50%] blur-3xl opacity-70"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.9, ease: 'easeOut' }}
                    style={{
                      background:
                        'radial-gradient(ellipse at center, hsl(190 95% 60% / 0.28), hsl(320 95% 62% / 0.18) 45%, transparent 70%)',
                    }}
                  />

                  {/* Floating decorative props anchored to hero box */}
                  <span
                    aria-hidden
                    className="hero-prop absolute left-[6%] top-4 w-6 h-6 rounded-md opacity-80"
                    style={{
                      background: 'linear-gradient(180deg, hsl(190 95% 60%), hsl(190 95% 35%))',
                      boxShadow: '0 0 16px hsl(190 95% 60% / 0.7), inset 0 1px 0 rgba(255,255,255,0.5)',
                      animationDelay: '0.4s',
                    }}
                  />
                  <span
                    aria-hidden
                    className="hero-prop absolute right-[8%] top-10 w-5 h-5 rounded-sm opacity-80"
                    style={{
                      background: 'linear-gradient(180deg, hsl(320 95% 65%), hsl(320 95% 38%))',
                      boxShadow: '0 0 14px hsl(320 95% 62% / 0.7), inset 0 1px 0 rgba(255,255,255,0.5)',
                      animationDelay: '1.2s',
                    }}
                  />

                  <HeroPhaseTint />

                  <div className="relative z-10 pt-14 sm:pt-20">
                    <GameTitle />
                  </div>
                </motion.div>

                {/* Single tagline — replaces the dual eyebrow/tagline stack */}
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
                  }}
                  className="-mt-1 max-w-xs text-center font-sans text-sm sm:text-[15px] text-white/70 leading-relaxed"
                >
                  Spark reactions, blast lines, and explore neon-lit worlds.
                </motion.p>

                {/* CTA CLUSTER — element row + Play + Daily, grouped tight */}
                <motion.div
                  className="flex flex-col items-center gap-4"
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.55, ease: 'easeOut', staggerChildren: 0.08 },
                    },
                  }}
                >
                  {/* Element rubber-tile row — sits right above CTA as a preview */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                    }}
                    className="flex items-center justify-center gap-2.5 sm:gap-3"
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
                        whileHover={{ y: -3 }}
                        whileTap={{ y: 1 }}
                        className={`relative w-11 h-11 sm:w-12 sm:h-12 ${bg} ${shadow} border-b-[5px] rounded-xl flex items-center justify-center cursor-pointer transition-shadow`}
                        style={{
                          boxShadow:
                            'inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 3px 10px rgba(0,0,0,0.35)',
                        }}
                      >
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} strokeWidth={2.5} />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute top-1 left-1.5 right-1.5 h-1.5 rounded-full bg-gradient-to-b from-white/55 to-transparent"
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Play button */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.92 },
                      show: {
                        opacity: 1,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 320, damping: 20 },
                      },
                    }}
                  >
                    <PixarButton onClick={handleStartGame} aria-label="Play" variant="primary" size="lg" shine>
                      Play
                    </PixarButton>
                  </motion.div>

                  {/* Daily Challenge — secondary link directly under Play */}
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                    }}
                    onClick={() => setShowDailyChallenge(true)}
                    className="ui-label-xs ui-btn-xs text-cyan-200/80 hover:text-cyan-100 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Daily Challenge</span>
                  </motion.button>
                </motion.div>

                {/* Stat chips — slim ground row, supporting info */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 border-t border-white/[0.06] w-full max-w-xs"
                >
                  <PixarStatChip label="Best" value={topScore.toLocaleString()} tone="blue" />
                  <PixarStatChip label="Streak" value={currentStreak} tone="yellow" />
                  <PixarStatChip label="XP" value={totalPoints.toLocaleString()} tone="neutral" />
                </motion.div>

                {/* Alley cat wanders at the bottom of the hero stage */}
                <HeroAlleyCat />
              </motion.div>
            )}
            
            {/* Game screen - when playing */}
            {hasStarted && (
              <>
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Hidden on phones to save vertical space (top bar already brands it) */}
                  <h1 className="hidden sm:block ui-label-lg">
                    <span className="bg-clip-text text-transparent bg-[linear-gradient(180deg,#ffffff,rgba(255,255,255,0.65))] drop-shadow-[0_0_12px_hsl(190_95%_60%/0.35)]">
                      Block Blast
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

                {/* Reaction Fever meter */}
                <FeverMeter meter={feverMeter} active={feverActive} endsAt={feverEndsAt} />

                {/* Bomb pressure meter — explains when bombs may drop */}
                {!isDailyChallenge && (
                  <BombMeter fillRatio={boardFillRatio} chance={bombChance} />
                )}

                {/* Hint — ghosts a helpful placement (works on desktop & mobile) */}
                {!gameState.isGameOver && (
                  <button
                    onClick={handleHint}
                    className="ui-btn-xs ui-label-xs mt-2 bg-white/[0.04] backdrop-blur-md border border-cyan-300/30 text-white/80 hover:text-white hover:border-cyan-300/60 hover:shadow-[0_0_18px_-4px_hsl(190_95%_60%/0.55)] active:scale-95 transition-all"
                    title="Show a helpful move"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_6px_hsl(190_95%_60%/0.7)]" />
                    Hint
                  </button>
                )}

                {/* Game Grid */}
                <div className="relative" style={{ perspective: '900px' }}>
                <motion.div animate={boardFlip} style={{ transformStyle: 'preserve-3d' }}>
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
                </motion.div>
                
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
                        
                        {/* Alley cat reaction */}
                        <motion.img
                          src={sitCatAsset.url}
                          alt="Neon alley cat"
                          initial={{ scale: 0.6, opacity: 0, y: 10 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.05 }}
                          className="w-20 sm:w-24 h-auto mx-auto mb-1 select-none pointer-events-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
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
                onDragHover={handleDragHover}
                onDragDrop={handleDragDrop}
                disabled={gameState.isGameOver}
                onRerollPiece={isDailyChallenge ? undefined : rerollPiece}
                rerollAvailable={rerollAvailable}
              />
            )}

            {/* Element Legend - tablets only (hidden on phones to save height; in the sidebar on desktop) */}
            {hasStarted && (
              <div className="mt-2 hidden sm:block lg:hidden">
                <ElementLegend />
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop only */}
          {hasStarted && (
            <div className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-52 sticky top-24 self-start max-h-[calc(100vh-8rem)]">
              {/* Reaction Feed Panel */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="neon-glass-panel overflow-y-auto max-h-[50vh] p-4"
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
                className="neon-glass-panel p-4"
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
                className="lg:hidden fixed top-20 right-4 z-40 w-52 md:w-56 neon-glass-panel p-4"
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
