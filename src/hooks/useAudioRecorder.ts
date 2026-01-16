import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioStore } from '@/store';
import type { AudioRecording, RecordingState } from '@/types';
import { WebAudioEncoder } from '@/utils/audioEncoder';

export interface UseAudioRecorderReturn {
  // State
  recordingState: RecordingState;
  duration: number;
  recording: AudioRecording | null;
  error: string | null;
  microphonePermission: 'granted' | 'denied' | 'prompt';

  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<AudioRecording | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  /** Controlla lo stato del permesso SENZA mostrare un prompt */
  checkMicrophonePermission: () => Promise<'granted' | 'denied' | 'prompt'>;
  /** Richiede il permesso (può mostrare un prompt del browser) */
  requestMicrophonePermission: () => Promise<boolean>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const {
    recordingState,
    currentRecording,
    microphonePermission,
    error,
    setRecordingState,
    setCurrentRecording,
    setMicrophonePermission,
    setError,
    resetRecording: resetStore,
  } = useAudioStore();

  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webAudioEncoderRef = useRef<WebAudioEncoder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const useWebAudioRef = useRef<boolean>(false); // Flag per sapere quale metodo stiamo usando

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Controlla lo stato del permesso SENZA mostrare un prompt
  const checkMicrophonePermission = useCallback(async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      // Controlla se l'API è disponibile
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Il tuo browser non supporta la registrazione audio. Prova Chrome o Firefox.');
        setMicrophonePermission('denied');
        return 'denied';
      }

      // Usa l'API Permissions per controllare senza prompt
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      const state = result.state as 'granted' | 'denied' | 'prompt';
      setMicrophonePermission(state);
      return state;
    } catch {
      // Se l'API Permissions non è supportata, ritorna 'prompt'
      return 'prompt';
    }
  }, [setMicrophonePermission, setError]);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Controlla se l'API è disponibile
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Il tuo browser non supporta la registrazione audio. Prova Chrome o Firefox.');
        setMicrophonePermission('denied');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicrophonePermission('granted');
      return true;
    } catch (err) {
      setMicrophonePermission('denied');
      const message = err instanceof Error ? err.message : 'Accesso al microfono negato';
      setError(message);
      return false;
    }
  }, [setMicrophonePermission, setError]);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      chunksRef.current = [];

      // Controlla se l'API è disponibile
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Il tuo browser non supporta la registrazione audio. Prova Chrome o Firefox.');
        setMicrophonePermission('denied');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicrophonePermission('granted');

      // Determina quale metodo usare
      const hasMediaRecorder = typeof window.MediaRecorder !== 'undefined';

      if (hasMediaRecorder) {
        // Usa MediaRecorder (browser desktop e Android)
        useWebAudioRef.current = false;

        // Determina il miglior formato supportato
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.start(100); // Raccoglie chunk ogni 100ms
      } else {
        // Usa Web Audio API (iOS Safari e altri browser senza MediaRecorder)
        useWebAudioRef.current = true;

        const encoder = new WebAudioEncoder({
          sampleRate: 44100,
          numChannels: 1,
        });
        webAudioEncoderRef.current = encoder;
        await encoder.start(stream);
      }

      setRecordingState('recording');
      startTimeRef.current = Date.now();

      // Timer per la durata
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nella registrazione';
      setError(message);
      setMicrophonePermission('denied');
    }
  }, [setRecordingState, setMicrophonePermission, setError]);

  const stopRecording = useCallback(async (): Promise<AudioRecording | null> => {
    return new Promise((resolve) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      if (useWebAudioRef.current) {
        // Web Audio API path
        const encoder = webAudioEncoderRef.current;
        if (!encoder) {
          resolve(null);
          return;
        }

        const blob = encoder.stop();
        webAudioEncoderRef.current = null;

        const recording: AudioRecording = {
          blob,
          duration: finalDuration,
          mimeType: 'audio/wav',
        };

        setCurrentRecording(recording);
        setRecordingState('stopped');

        // Ferma tutte le tracce
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        resolve(recording);
      } else {
        // MediaRecorder path
        const mediaRecorder = mediaRecorderRef.current;
        if (!mediaRecorder) {
          resolve(null);
          return;
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });

          const recording: AudioRecording = {
            blob,
            duration: finalDuration,
            mimeType: mediaRecorder.mimeType,
          };

          setCurrentRecording(recording);
          setRecordingState('stopped');

          // Ferma tutte le tracce
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          resolve(recording);
        };

        mediaRecorder.stop();
      }
    });
  }, [setCurrentRecording, setRecordingState]);

  const pauseRecording = useCallback(() => {
    if (useWebAudioRef.current) {
      // Web Audio API non supporta pause/resume nativamente
      return;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setRecordingState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [setRecordingState]);

  const resumeRecording = useCallback(() => {
    if (useWebAudioRef.current) {
      // Web Audio API non supporta pause/resume nativamente
      return;
    }

    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setRecordingState('recording');

      // Riprendi il timer
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    }
  }, [setRecordingState]);

  const resetRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    webAudioEncoderRef.current = null;
    useWebAudioRef.current = false;
    setDuration(0);
    resetStore();
  }, [resetStore]);

  return {
    recordingState,
    duration,
    recording: currentRecording,
    error,
    microphonePermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    checkMicrophonePermission,
    requestMicrophonePermission,
  };
}
