export function KeyboardHints() {
  const hints = [
    { keys: ['←', '→'], action: 'Move' },
    { keys: ['↓'], action: 'Soft Drop' },
    { keys: ['Space'], action: 'Hard Drop' },
    { keys: ['Z', 'X'], action: 'Rotate' },
    { keys: ['P'], action: 'Pause' },
  ];

  return (
    <div className="hidden md:block bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
        🎮 Controls
      </h3>
      <div className="space-y-2">
        {hints.map(({ keys, action }) => (
          <div key={action} className="flex items-center justify-between text-xs">
            <div className="flex gap-1">
              {keys.map((key) => (
                <kbd
                  key={key}
                  className="px-2 py-1 bg-slate-700 rounded text-slate-300 font-mono"
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span className="text-slate-400">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
