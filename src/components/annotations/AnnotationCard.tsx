import { TagIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { formatRelativeTime } from '@/utils';
import type { Annotation } from '@/types';

interface AnnotationCardProps {
  annotation: Annotation;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export function AnnotationCard({
  annotation,
  onEdit,
  onDelete,
  onClick,
  isSelected,
}: AnnotationCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group rounded-lg border-l-4 transition-all cursor-pointer
        ${isSelected ? 'bg-white shadow-md' : 'bg-gray-50 hover:bg-white hover:shadow'}
      `}
      style={{ borderLeftColor: annotation.color }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {annotation.location.page && (
              <span className="bg-gray-100 px-2 py-0.5 rounded">
                Pag. {annotation.location.page}
              </span>
            )}
            <span>{formatRelativeTime(new Date(annotation.createdAt))}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Selected text */}
        <p className="text-sm text-gray-900 mb-2 line-clamp-3">{annotation.selectedText}</p>

        {/* Notes */}
        {annotation.notes && (
          <p className="text-sm text-gray-600 italic mb-2 line-clamp-2">{annotation.notes}</p>
        )}

        {/* Audio player */}
        {annotation.audioMemo?.blob && (
          <div className="mb-2">
            <AudioPlayer
              key={annotation.audioMemo.id}
              audioBlob={annotation.audioMemo.blob}
              duration={annotation.audioMemo.duration}
            />
          </div>
        )}

        {/* Tags */}
        {annotation.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {annotation.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
              >
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
