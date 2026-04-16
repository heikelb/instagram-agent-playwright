# Audio Assets

Place the following MP3 files in this folder. The app works silently if they are missing.

## Required files

### `brown-noise.mp3`
- **Type** : Bruit brun (Brown noise / pink noise)
- **Duration**: 30+ minutes, looped
- **Recommended**: -14 LUFS, low-pass filtered for warmth
- **Used in** : Sessions "Confiance Absolue" and "Identité Champion"
- **Source suggestions**:
  - [myNoise.net](https://mynoise.net/NoiseMachines/brownNoiseGenerator.php) — export via browser
  - [freesound.org](https://freesound.org/search/?q=brown+noise) — search "brown noise loop"
  - Generate with Audacity: Generate → Noise → Brown, export as MP3

### `binaural-alpha.mp3`
- **Type** : Battements binauraux — fréquence alpha (8–12 Hz)
- **Duration**: 30+ minutes, looped
- **Recommended**: Base frequency 200 Hz, beat frequency 10 Hz
  - Left ear: 200 Hz sine wave
  - Right ear: 210 Hz sine wave
  - Result: 10 Hz binaural beat (alpha state)
- **Used in** : Sessions "Maître du NON" and "Flow Commercial"
- **Source suggestions**:
  - [mynoise.net/NoiseMachines/binauralBeatGenerator.php](https://mynoise.net/NoiseMachines/binauralBeatGenerator.php)
  - Generate with Audacity:
    1. Generate → Tone (200 Hz, left channel)
    2. Generate → Tone (210 Hz, right channel)
    3. Mix to stereo, export as MP3
  - [freesound.org](https://freesound.org/search/?q=binaural+alpha)

## Notes

- **Use stereo headphones** for binaural beats to be effective
- Keep volume at ~35–40% for best experience
- Files must be named exactly `brown-noise.mp3` and `binaural-alpha.mp3`
- The app catches import errors — missing files cause silent mode (no crash)
