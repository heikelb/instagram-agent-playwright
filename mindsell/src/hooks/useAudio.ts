import { Audio } from 'expo-av';
import { useCallback, useRef } from 'react';

type AudioType = 'brown-noise' | 'binaural-alpha';

// Map audio type to local asset. Replace placeholder files with real MP3s.
const AUDIO_ASSETS: Record<AudioType, number | null> = {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  'brown-noise': (() => {
    try {
      return require('../../assets/audio/brown-noise.mp3');
    } catch {
      return null;
    }
  })(),
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  'binaural-alpha': (() => {
    try {
      return require('../../assets/audio/binaural-alpha.mp3');
    } catch {
      return null;
    }
  })(),
};

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);

  const play = useCallback(async (type: AudioType, volume = 0.4) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const asset = AUDIO_ASSETS[type];
      if (!asset) return; // No audio file — silent mode

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(asset, {
        shouldPlay: true,
        isLooping: true,
        volume,
      });
      soundRef.current = sound;
    } catch {
      // Gracefully ignore if audio unavailable
    }
  }, []);

  const setVolume = useCallback(async (volume: number) => {
    try {
      await soundRef.current?.setVolumeAsync(volume);
    } catch {
      // ignore
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      await soundRef.current?.pauseAsync();
    } catch {
      // ignore
    }
  }, []);

  const resume = useCallback(async () => {
    try {
      await soundRef.current?.playAsync();
    } catch {
      // ignore
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {
      // ignore
    }
  }, []);

  return { play, pause, resume, stop, setVolume };
}
