import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Flame, Droplets, FlaskConical, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { modalStyles } from '@/game/theme';

interface ReactionTutorialProps {
  onComplete: () => void;
}

const TUTORIAL_STORAGE_KEY = 'elemental-blast-tutorial-seen';

const tutorialSteps = [
  {
    title: 'Clear Lines',
    description: 'Place pieces to fill complete rows or columns. Full lines disappear and score points!',
    visual: (
      <div className="flex gap-1 items-center justify-center my-4">
        <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF9F43] rounded-lg" />
        <div className="w-8 h-8 bg-gradient-to-br from-[#00B4D8] to-[#00E5FF] rounded-lg" />
        <div className="w-8 h-8 bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] rounded-lg" />
        <div className="w-8 h-8 bg-gradient-to-br from-[#FFB347] to-[#FFD700] rounded-lg" />
        <motion.div
          animate={{ scale: [1, 0.8, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          className="absolute flex gap-1"
        >
          <Sparkles className="w-6 h-6 text-[#FFD700]" />
        </motion.div>
      </div>
    ),
    icon: Sparkles,
    color: '#FFD700',
  },
  {
    title: 'Fire Burns Wood',
    description: 'Place Fire 🔥 next to Wood 🪵 and watch it burn to Ash! Earn bonus points for reactions.',
    visual: (
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F43 100%)', boxShadow: '0 4px 12px rgba(255,107,53,0.4)' }}>
          🔥
        </div>
        <motion.div
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-[#FF9F43]"
        >
          →
        </motion.div>
        <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center text-2xl relative">
          🪵
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-[#FF6B35]/50 rounded-xl"
          />
        </div>
        <span className="text-white/60">=</span>
        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center text-2xl">
          💨
        </div>
      </div>
    ),
    icon: Flame,
    color: '#FF6B35',
  },
  {
    title: 'Water Extinguishes Fire',
    description: 'Water 💧 and Fire 🔥 cancel each other out! Both disappear in a splash of steam.',
    visual: (
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #00E5FF 100%)', boxShadow: '0 4px 12px rgba(0,229,255,0.4)' }}>
          💧
        </div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-2xl"
        >
          💥
        </motion.div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F43 100%)', boxShadow: '0 4px 12px rgba(255,107,53,0.4)' }}>
          🔥
        </div>
        <span className="text-white/60">=</span>
        <motion.div
          animate={{ y: [-2, 2, -2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl"
        >
          💨💨
        </motion.div>
      </div>
    ),
    icon: Droplets,
    color: '#00E5FF',
  },
  {
    title: 'Acid Dissolves Everything',
    description: 'Acid 🧪 is the wildcard! It dissolves ANY adjacent element for bonus points.',
    visual: (
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
          style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)', boxShadow: '0 4px 12px rgba(76,175,80,0.4)' }}>
          🧪
        </div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-[#8BC34A]"
        >
          →
        </motion.div>
        <div className="grid grid-cols-2 gap-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg opacity-50"
            style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF9F43 100%)' }}>🔥</div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg opacity-50"
            style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #00E5FF 100%)' }}>💧</div>
          <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center text-lg opacity-50">🪵</div>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-lg opacity-50">🪨</div>
        </div>
        <span className="text-white/60">=</span>
        <motion.div
          animate={{ scale: [1, 0, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-3xl"
        >
          💀
        </motion.div>
      </div>
    ),
    icon: FlaskConical,
    color: '#8BC34A',
  },
];

const ReactionTutorial: React.FC<ReactionTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasSeenTutorial) {
      setIsVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const StepIcon = step.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="rounded-2xl p-6 max-w-md w-full relative overflow-hidden"
          style={modalStyles.container}
        >
          {/* Decorative top gradient bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, #FF6B35 0%, #FFD700 50%, #00E5FF 100%)',
            }}
          />

          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all`}
                style={{
                  width: index === currentStep ? '24px' : '8px',
                  background: index === currentStep 
                    ? step.color 
                    : index < currentStep 
                      ? 'rgba(255,255,255,0.6)' 
                      : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-2" style={{ color: step.color }}>
              <StepIcon className="w-6 h-6" />
              <span className="text-lg font-bold">{step.title}</span>
            </div>

            {step.visual}

            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {step.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1 text-white/50 hover:text-white/80 hover:bg-white/10"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 text-white border-0 hover:opacity-90"
                  style={modalStyles.primaryButtonCyan}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleComplete}
                className="w-full text-white border-0 hover:opacity-90"
                style={modalStyles.primaryButtonFire}
              >
                <Zap className="w-5 h-5 mr-2" />
                Let's Play! 🎮
              </Button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReactionTutorial;
