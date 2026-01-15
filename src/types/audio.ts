export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface AudioRecording {
  blob: Blob | null;
  duration: number;
  mimeType: string;
}

export interface AudioState {
  recordingState: RecordingState;
  currentRecording: AudioRecording | null;
  isPlaying: boolean;
  playbackProgress: number;
  microphonePermission: 'granted' | 'denied' | 'prompt';
  error: string | null;
}

export interface AudioPlaybackOptions {
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
}
