import { useEffect, useState } from 'react';
import {
  MicrophoneIcon,
  StopIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';
import { useAudioRecorder, useAudioPlayer } from '@/hooks';
import { Button } from '@/components/common';
import { formatDuration } from '@/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number, mimeType: string) => void;
  onCancel: () => void;
  /** Callback per notificare lo stato di registrazione (usato per prevenire chiusura modale) */
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function VoiceRecorder({ onRecordingComplete, onCancel, onRecordingStateChange }: VoiceRecorderProps) {
  const {
    recordingState,
    duration,
    recording,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    checkMicrophonePermission,
    requestMicrophonePermission,
  } = useAudioRecorder();

  // Passa il blob della registrazione completata all'audio player
  const audioPlayer = useAudioPlayer(recording?.blob ?? null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  // Reset dello stato al mount per partire sempre puliti
  useEffect(() => {
    resetRecording();
  }, [resetRecording]);

  useEffect(() => {
    // Controlla supporto API prima di tutto
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setIsSupported(false);
      return;
    }

    // Verifica permessi al mount SENZA mostrare prompt del browser
    checkMicrophonePermission().then((state) => {
      // Se già granted o denied, impostiamo lo stato
      // Se 'prompt', lasciamo null così l'utente può cliccare "Inizia"
      if (state === 'granted') {
        setHasPermission(true);
      } else if (state === 'denied') {
        setHasPermission(false);
      }
      // Se 'prompt', hasPermission rimane null (stato iniziale)
    });
  }, [checkMicrophonePermission]);

  // Notifica cambio stato registrazione
  useEffect(() => {
    const isActiveRecording = recordingState === 'recording' || recordingState === 'paused';
    onRecordingStateChange?.(isActiveRecording);
  }, [recordingState, onRecordingStateChange]);


  const handleStartRecording = async () => {
    // Notifica PRIMA di richiedere il permesso per evitare chiusura modale
    onRecordingStateChange?.(true);
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleConfirm = () => {
    if (recording?.blob) {
      onRecordingComplete(recording.blob, recording.duration, recording.mimeType);
    }
  };

  const handleDiscard = () => {
    resetRecording();
  };

  // Se l'API non è supportata
  if (!isSupported) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
      <div className="text-center py-6">
        <MicrophoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <div className="space-y-3 mb-4">
          <p className="text-red-600 font-semibold">
            {isIOS ? 'iOS non supporta la registrazione audio' : 'Browser non supportato'}
          </p>

          {isIOS ? (
            <>
              <p className="text-gray-600 text-sm">
                Purtroppo <strong>nessun browser su iOS</strong> (Safari, Chrome, Firefox) supporta la registrazione audio nei browser web.
              </p>
              <p className="text-gray-600 text-sm">
                Questa è una limitazione di Apple/iOS, non dell'app.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-blue-800 text-sm font-medium mb-2">💡 Alternative:</p>
                <ul className="text-left text-sm text-blue-700 space-y-1">
                  <li>• Usa note testuali invece di audio</li>
                  <li>• Usa un computer desktop/laptop</li>
                  <li>• Usa un dispositivo Android</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm">
                Il tuo browser non supporta la registrazione audio.
              </p>
              <p className="text-gray-600 text-sm">
                Prova ad usare:
              </p>
              <ul className="text-left inline-block text-sm text-gray-700">
                <li>• Chrome o Edge (versione recente)</li>
                <li>• Firefox</li>
                <li>• Safari Desktop (macOS/Windows)</li>
              </ul>
            </>
          )}
        </div>
        <Button variant="ghost" onClick={onCancel}>
          Chiudi
        </Button>
      </div>
    );
  }

  // Se il permesso e negato
  if (hasPermission === false) {
    return (
      <div className="text-center py-6">
        <MicrophoneIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600 mb-4">
          Per registrare memo vocali, devi consentire l'accesso al microfono.
        </p>
        <Button
          variant="primary"
          onClick={() => requestMicrophonePermission().then(setHasPermission)}
        >
          Riprova
        </Button>
      </div>
    );
  }

  // Stato di registrazione completata - preview
  if (recordingState === 'stopped' && recording?.blob) {
    return (
      <div className="space-y-4">
        {/* Audio preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Durata: {formatDuration(recording.duration)}
            </span>
            <button
              onClick={audioPlayer.toggle}
              className="p-2 rounded-full bg-teatro-100 text-teatro-600 hover:bg-teatro-200 transition-colors"
            >
              {audioPlayer.isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-teatro-500 transition-all duration-100"
              style={{ width: `${audioPlayer.progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleDiscard}
            leftIcon={<TrashIcon className="w-4 h-4" />}
            className="flex-1"
          >
            Scarta
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            leftIcon={<CheckIcon className="w-4 h-4" />}
            className="flex-1"
          >
            Conferma
          </Button>
        </div>
      </div>
    );
  }

  // Stato di registrazione
  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>
      )}

      {/* Recording indicator */}
      <div className="flex flex-col items-center py-6">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${
            recordingState === 'recording'
              ? 'bg-red-500 animate-pulse'
              : recordingState === 'paused'
                ? 'bg-yellow-500'
                : 'bg-gray-200'
          }`}
          role="status"
          aria-label={
            recordingState === 'recording'
              ? 'Registrazione in corso'
              : recordingState === 'paused'
                ? 'Registrazione in pausa'
                : 'Pronto per registrare'
          }
        >
          <MicrophoneIcon
            className={`w-10 h-10 ${
              recordingState === 'idle' ? 'text-gray-400' : 'text-white'
            }`}
            aria-hidden="true"
          />
        </div>

        {/* Duration */}
        <span
          className="text-2xl font-mono font-semibold text-gray-900"
          aria-live="polite"
          aria-label={`Durata: ${formatDuration(duration)}`}
        >
          {formatDuration(duration)}
        </span>

        {/* Status text */}
        <span className="text-sm text-gray-500 mt-1" aria-hidden="true">
          {recordingState === 'idle' && 'Premi per registrare'}
          {recordingState === 'recording' && 'Registrazione in corso...'}
          {recordingState === 'paused' && 'In pausa'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {recordingState === 'idle' && (
          <>
            <Button variant="ghost" onClick={onCancel}>
              Annulla
            </Button>
            <Button
              variant="primary"
              onClick={handleStartRecording}
              leftIcon={<MicrophoneIcon className="w-5 h-5" />}
            >
              Inizia
            </Button>
          </>
        )}

        {recordingState === 'recording' && (
          <>
            <Button
              variant="secondary"
              onClick={pauseRecording}
              leftIcon={<PauseIcon className="w-5 h-5" />}
            >
              Pausa
            </Button>
            <Button
              variant="danger"
              onClick={handleStopRecording}
              leftIcon={<StopIcon className="w-5 h-5" />}
            >
              Stop
            </Button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Button
              variant="secondary"
              onClick={resumeRecording}
              leftIcon={<PlayIcon className="w-5 h-5" />}
            >
              Riprendi
            </Button>
            <Button
              variant="danger"
              onClick={handleStopRecording}
              leftIcon={<StopIcon className="w-5 h-5" />}
            >
              Stop
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
