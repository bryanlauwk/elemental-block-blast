import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Flame, Droplets, FlaskConical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg" />
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg" />
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg" />
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg" />
        <motion.div
          animate={{ scale: [1, 0.8, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          className="absolute flex gap-1"
        >
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </motion.div>
      </div>
    ),
    icon: Sparkles,
    color: 'text-yellow-400',
  },
  {
    title: 'Fire Burns Wood',
    description: 'Place Fire 🔥 next to Wood 🪵 and watch it burn to Ash! Earn bonus points for reactions.',
    visual: (
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
          🔥
        </div>
        <motion.div
          animate={{ x: [-5, 5, -5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-orange-400"
        >
          →
        </motion.div>
        <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center text-2xl relative">
          🪵
          <motion.div
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-orange-500/50 rounded-xl"
          />
        </div>
        <span className="text-white/60">=</span>
        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center text-2xl">
          💨
        </div>
      </div>
    ),
    icon: Flame,
    color: 'text-orange-400',
  },
  {
    title: 'Water Extinguishes Fire',
    description: 'Water 💧 and Fire 🔥 cancel each other out! Both disappear in a splash of steam.',
    visual: (
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
          💧
        </div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-2xl"
        >
          💥
        </motion.div>
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
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
    color: 'text-blue-400',
  },
  {
    title: 'Acid Dissolves Everything',
    description: 'Acid 🧪 is the wildcard! It dissolves ANY adjacent element for bonus points.',
    visual: (
      <div className="flex items-center justify-center gap-4 my-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-green-500/30">
          🧪
        </div>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-green-400"
        >
          →
        </motion.div>
        <div className="grid grid-cols-2 gap-1">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-lg opacity-50">🔥</div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-lg opacity-50">💧</div>
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
    color: 'text-green-400',
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
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/10"
        >
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
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-white w-6'
                    : index < currentStep
                    ? 'bg-white/60'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 ${step.color} mb-2`}>
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
                  className="flex-1 text-white/50 hover:text-white/80"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-white text-black hover:bg-white/90"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleComplete}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90"
              >
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
