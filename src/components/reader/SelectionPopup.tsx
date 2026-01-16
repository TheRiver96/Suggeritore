import { useState } from 'react';
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Modal, TagInput, ColorSelector } from '@/components/common';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { useAnnotationStore } from '@/store';
import { useBreakpoints } from '@/hooks';
import { DEFAULT_ANNOTATION_COLORS } from '@/types/annotation';
import type { TextSelectionData } from '@/hooks/useTextSelection';
import type { AudioMemo, AnnotationLocation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SelectionPopupProps {
  selection: TextSelectionData;
  onClose: () => void;
  documentId: string;
  currentPage: number;
}

export function SelectionPopup({
  selection,
  onClose,
  documentId,
  currentPage,
}: SelectionPopupProps) {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_ANNOTATION_COLORS[0]);
  const [audioMemo, setAudioMemo] = useState<AudioMemo | null>(null);

  const { createAnnotation } = useAnnotationStore();
  const { isMobile, isTablet } = useBreakpoints();
  const useMobileLayout = isMobile || isTablet;

  const handleRecordingComplete = (blob: Blob, duration: number, mimeType: string) => {
    setAudioMemo({
      id: uuidv4(),
      blob,
      duration,
      mimeType,
    });
    setIsRecorderOpen(false);
  };

  const handleSaveAnnotation = async () => {
    const location: AnnotationLocation = {
      page: currentPage,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
    };

    await createAnnotation({
      documentId,
      location,
      selectedText: selection.text,
      textContext: selection.context,
      audioMemo: audioMemo ?? undefined,
      tags,
      color: selectedColor,
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <>
      {/* Contenuto - stile cambia in base a desktop/mobile */}
      <div className={useMobileLayout ? '' : 'w-80 flex-shrink-0 bg-white shadow-xl border-l border-gray-200 p-4 overflow-y-auto'}>
        {/* Header - solo su desktop (su mobile è nel BottomSheet) */}
        {!useMobileLayout && (
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Nuova annotazione</h3>
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5 transition-transform duration-200" />
            </button>
          </div>
        )}

        {/* Selected text preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border-l-4" style={{ borderLeftColor: selectedColor }}>
          <p className={`text-gray-700 line-clamp-3 ${useMobileLayout ? 'text-base' : 'text-sm'}`}>
            {selection.text}
          </p>
        </div>

        {/* Color selector */}
        <div className="mb-4">
          <ColorSelector
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>

        {/* Audio memo */}
        <div className="mb-4">
          <label className={`font-medium text-gray-500 mb-2 block ${useMobileLayout ? 'text-sm' : 'text-xs'}`}>
            Memo vocale
          </label>
          {audioMemo ? (
            <div className="flex items-center gap-2 bg-teatro-50 rounded-lg p-3">
              <MicrophoneIcon className={useMobileLayout ? 'w-5 h-5' : 'w-4 h-4'} />
              <span className={`text-teatro-700 ${useMobileLayout ? 'text-base' : 'text-sm'}`}>
                Registrazione salvata ({Math.round(audioMemo.duration)}s)
              </span>
              <button
                onClick={() => setAudioMemo(null)}
                className="ml-auto text-gray-400 hover:text-red-600 transition-all duration-200 ease-in-out hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <XMarkIcon className={`${useMobileLayout ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-200`} />
              </button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size={useMobileLayout ? 'md' : 'sm'}
              onClick={() => setIsRecorderOpen(true)}
              leftIcon={<MicrophoneIcon className={useMobileLayout ? 'w-5 h-5' : 'w-4 h-4'} />}
              className="w-full"
            >
              Registra memo vocale
            </Button>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <TagInput tags={tags} onTagsChange={setTags} />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className={`font-medium text-gray-500 mb-2 block ${useMobileLayout ? 'text-sm' : 'text-xs'}`}>
            Note (opzionale)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi note..."
            rows={useMobileLayout ? 3 : 2}
            className={`w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-teatro-500 ${useMobileLayout ? 'text-base min-h-[44px]' : 'text-sm'}`}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size={useMobileLayout ? 'md' : 'sm'}
            onClick={onClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            variant="primary"
            size={useMobileLayout ? 'md' : 'sm'}
            onClick={handleSaveAnnotation}
            className="flex-1"
          >
            Salva
          </Button>
        </div>
      </div>

      {/* Voice Recorder Modal */}
      <Modal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        title="Registra memo vocale"
        size="md"
        preventClose={isRecording}
      >
        <VoiceRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={() => setIsRecorderOpen(false)}
          onRecordingStateChange={setIsRecording}
        />
      </Modal>
    </>
  );
}
