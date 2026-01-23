export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDurationLong(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins === 0) {
    return `${secs} sec`;
  }
  if (secs === 0) {
    return `${mins} min`;
  }
  return `${mins} min ${secs} sec`;
}

export function isAudioSupported(): boolean {
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasWebAudio = typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
  return (hasMediaRecorder || hasWebAudio) && typeof navigator.mediaDevices !== 'undefined';
}

export function getSupportedMimeTypes(): string[] {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  return types.filter((type) => MediaRecorder.isTypeSupported(type));
}
