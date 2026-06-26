## Goal
Replace each of the 8 short lo-fi mood tracks with a multi-minute version that loops seamlessly in the background.

## Approach
1. **Regenerate audio** via the ElevenLabs Music API at ~3 minutes per mood (`music_length_ms: 180000`), using prompts that explicitly request a seamless, loopable lo-fi loop with consistent tempo/key and no intro/outro fade. One file per mood: `cozy`, `rainy`, `night`, `upbeat`, `morning`, `dj`, `sunset`, `coffee`.
2. **Upload via `lovable-assets`** and overwrite the existing pointers under `src/assets/music/*.mp3.asset.json`. No code import changes needed — `src/game/sounds.ts` already imports from those pointer files.
3. **Confirm seamless loop playback**: `startTrack()` in `src/game/sounds.ts` already sets `audio.loop = true`, so once tracks are longer the same `<audio>` element will keep looping indefinitely. No engine changes required.
4. **Light polish (optional, same file)**: keep the current crossfade-free loop, but verify `preload = 'auto'` is enough; if not, add a tiny `audio.addEventListener('ended', ...)` safety net (browsers honor `loop` natively, so this is only a fallback).

## Technical notes
- ElevenLabs Music API: `POST https://api.elevenlabs.io/v1/music` with `prompt` + `music_length_ms` (max 300000 = 5 min). Target 180000 ms for cost/quality balance.
- Prompt template per mood: "Lo-fi {mood descriptor}, ~{bpm} BPM, mellow {instrumentation}. Seamless loop: identical energy and key at start and end, no intro, no outro, no fade in or out, no spoken words."
- Files written: 8 updated `.asset.json` pointers in `src/assets/music/`. No new files, no deleted files, no changes to `sounds.ts` unless the fallback `ended` handler is added.
- Synthesized Web Audio fallback in `createLoFiMusic` stays untouched — only kicks in if a track URL is missing.

## Out of scope
- No new moods, no UI changes in `SoundSettings.tsx`, no changes to SFX.
