import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { useAudioPlayer } from '@/hooks';
import { formatDuration } from '@/utils';

interface AudioPlayerProps {
  audioBlob: Blob;
  duration?: number;
  compact?: boolean;
}

export function AudioPlayer({ audioBlob, duration, compact = false }: AudioPlayerProps) {
  // Passa il blob direttamente all'hook - verrà caricato lazy al play
  const player = useAudioPlayer(audioBlob);

  const displayDuration = duration ?? player.duration;

  if (compact) {
    return (
      <button
        onClick={player.toggle}
        className="inline-flex items-center gap-1.5 px-2 py-1 bg-teatro-50 text-teatro-700 rounded-full hover:bg-teatro-100 transition-colors text-sm"
        aria-label={player.isPlaying ? 'Metti in pausa' : 'Riproduci audio'}
      >
        {player.isPlaying ? (
          <PauseIcon className="w-3.5 h-3.5" />
        ) : (
          <PlayIcon className="w-3.5 h-3.5" />
        )}
        <span>{formatDuration(displayDuration)}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3" role="group" aria-label="Player audio">
      <button
        onClick={player.toggle}
        className="p-2 rounded-full bg-teatro-600 text-white hover:bg-teatro-700 transition-colors flex-shrink-0"
        aria-label={player.isPlaying ? 'Metti in pausa' : 'Riproduci audio'}
      >
        {player.isPlaying ? (
          <PauseIcon className="w-5 h-5" />
        ) : (
          <PlayIcon className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {/* Progress bar */}
        <div
          className="h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            player.seek(percent * player.duration);
          }}
          role="slider"
          aria-label="Progresso audio"
          aria-valuenow={Math.round(player.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-teatro-500 transition-all duration-100"
            style={{ width: `${player.progress}%` }}
          />
        </div>

        {/* Time */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span aria-label="Tempo corrente">{formatDuration(player.currentTime)}</span>
          <span aria-label="Durata totale">{formatDuration(displayDuration)}</span>
        </div>
      </div>
    </div>
  );
}
