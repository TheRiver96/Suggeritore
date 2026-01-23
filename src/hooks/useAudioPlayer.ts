import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoaded: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

export function useAudioPlayer(blob: Blob | null): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const blobRef = useRef<Blob | null>(null);

  // Crea l'elemento audio una sola volta
  useEffect(() => {
    const audio = document.createElement('audio');
    audio.setAttribute('playsinline', '');
    audio.setAttribute('preload', 'metadata');
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }
    };
  }, []);

  // Carica il blob solo quando cambia effettivamente
  const loadBlob = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audioRef.current || !blob) {
        reject(new Error('No audio element or blob'));
        return;
      }

      // Se già caricato con lo stesso blob, non ricaricare
      if (isLoaded && blobRef.current === blob) {
        resolve();
        return;
      }

      // Revoca URL precedente
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      setIsLoaded(false);
      blobRef.current = blob;

      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      audioRef.current.src = url;

      const onCanPlay = () => {
        audioRef.current?.removeEventListener('canplay', onCanPlay);
        setIsLoaded(true);
        resolve();
      };
      const onError = () => {
        audioRef.current?.removeEventListener('error', onError);
        reject(new Error('Failed to load audio'));
      };
      audioRef.current.addEventListener('canplay', onCanPlay);
      audioRef.current.addEventListener('error', onError);
      audioRef.current.load();
    });
  }, [blob, isLoaded]);

  const play = useCallback(async () => {
    if (!audioRef.current || !blob) return;

    // Carica il blob se non è ancora caricato o se è cambiato
    if (!isLoaded || blobRef.current !== blob) {
      await loadBlob();
    }

    await audioRef.current.play();
  }, [blob, isLoaded, loadBlob]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current && isLoaded) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  }, [isLoaded, duration]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    isPlaying,
    isLoaded,
    currentTime,
    duration,
    progress,
    play,
    pause,
    toggle,
    seek,
    setVolume,
  };
}
