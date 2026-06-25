import { useEffect, useState } from 'react';
import { Beaker, Blocks, Box, Sparkles } from 'lucide-react';
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
    <div className="pointer-events-none fixed inset-x-3 bottom-4 z-40 mx-auto max-w-md sm:bottom-6">
      <div className="pointer-events-auto overflow-hidden rounded-[28px] border border-white/20 bg-white/10 p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-pixar-yellow">Choose Mode</p>
            <p className="text-xs font-bold text-white/58">Classic arcade or 4-face Cube Lab</p>
          </div>
          <Sparkles className="h-5 w-5 text-pixar-yellow drop-shadow" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={playClassic}
            className="group rounded-3xl border border-white/16 bg-white/10 p-3 text-left shadow-inner transition hover:border-pixar-yellow/60 hover:bg-white/14 active:scale-[0.98]"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-pixar-red text-white shadow-lg shadow-pixar-red/20">
              <Blocks className="h-5 w-5" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-white">Classic</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-white/52">Fast 2D puzzle board</p>
          </button>

          <button
            onClick={() => navigate('/cube')}
            className="group rounded-3xl border border-pixar-blue/35 bg-pixar-blue/12 p-3 text-left shadow-inner transition hover:border-pixar-blue/70 hover:bg-pixar-blue/18 active:scale-[0.98]"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-pixar-blue text-white shadow-lg shadow-pixar-blue/20">
              <Box className="h-5 w-5" />
            </div>
            <p className="text-sm font-black uppercase tracking-[0.12em] text-white">Cube Lab</p>
            <p className="mt-1 text-[10px] font-bold leading-tight text-white/52">4-side orbit mode</p>
          </button>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-white/10 bg-black/12 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/45 transition hover:text-white/75"
        >
          <Beaker className="h-3.5 w-3.5" /> Hide Mode Dock
        </button>
      </div>
    </div>
  );
}
