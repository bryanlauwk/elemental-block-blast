import { useEffect, useState } from 'react';
import { Beaker, Blocks, Box, Sparkles, Zap } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const findClassicPlayButton = () => {
  const buttons = Array.from(document.querySelectorAll('button'));
  return buttons.find((button) => button.textContent?.trim().toLowerCase() === 'play') as HTMLButtonElement | undefined;
};

export default function LandingModeDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGameplayVisible, setIsGameplayVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = () => setIsGameplayVisible(Boolean(document.getElementById('bb-grid')));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (location.pathname !== '/' || isGameplayVisible || dismissed) return null;

  const playClassic = () => {
    const playButton = findClassicPlayButton();
    if (playButton) {
      playButton.click();
      setDismissed(true);
      return;
    }
    setDismissed(true);
  };

  return (
    <div className="v3-mode-shell">
      <div className="v3-mode-card">
        <div className="v3-mode-hero">
          <div>
            <p className="v3-mode-title">Elemental Control Room</p>
            <p className="v3-mode-subtitle">Pick your puzzle mode before the run starts.</p>
          </div>
          <div className="v3-mode-orb" aria-hidden>
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="v3-mode-grid">
          <button
            onClick={playClassic}
            className="v3-mode-option"
            style={{ ['--mode-accent' as string]: 'hsl(var(--pixar-red))' }}
            aria-label="Play Classic Mode"
          >
            <div className="v3-mode-icon">
              <Blocks className="h-5 w-5" />
            </div>
            <p className="v3-mode-name">Classic</p>
            <p className="v3-mode-copy">Fast arcade board. Complete lines and chain reactions.</p>
            <span className="v3-mode-meta"><Zap className="h-3 w-3" /> Best start</span>
          </button>

          <button
            onClick={() => navigate('/cube')}
            className="v3-mode-option"
            style={{ ['--mode-accent' as string]: 'hsl(var(--pixar-blue))' }}
            aria-label="Play Cube Lab"
          >
            <div className="v3-mode-icon">
              <Box className="h-5 w-5" />
            </div>
            <p className="v3-mode-name">Cube Lab</p>
            <p className="v3-mode-copy">4-side orbit board. Rotate, sync faces, chase combos.</p>
            <span className="v3-mode-meta"><Beaker className="h-3 w-3" /> Advanced</span>
          </button>
        </div>

        <div className="v3-mode-footer">
          <button onClick={() => setDismissed(true)} className="v3-dock-pill">
            Hide selector
          </button>
        </div>
      </div>
    </div>
  );
}
