import { create } from 'zustand';
import type { AudioState, RecordingState, AudioRecording } from '@/types';

interface AudioActions {
  setRecordingState: (state: RecordingState) => void;
  setCurrentRecording: (recording: AudioRecording | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackProgress: (progress: number) => void;
  setMicrophonePermission: (permission: 'granted' | 'denied' | 'prompt') => void;
  setError: (error: string | null) => void;
  resetRecording: () => void;
}

type AudioStore = AudioState & AudioActions;

const initialState: AudioState = {
  recordingState: 'idle',
  currentRecording: null,
  isPlaying: false,
  playbackProgress: 0,
  microphonePermission: 'prompt',
  error: null,
};

export const useAudioStore = create<AudioStore>((set) => ({
  ...initialState,

  setRecordingState: (recordingState) => {
    set({ recordingState });
  },

  setCurrentRecording: (currentRecording) => {
    set({ currentRecording });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setPlaybackProgress: (playbackProgress) => {
    set({ playbackProgress });
  },

  setMicrophonePermission: (microphonePermission) => {
    set({ microphonePermission });
  },

  setError: (error) => {
    set({ error });
  },

  resetRecording: () => {
    set({
      recordingState: 'idle',
      currentRecording: null,
      isPlaying: false,
      playbackProgress: 0,
      error: null,
    });
  },
}));
