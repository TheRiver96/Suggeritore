import { useState } from 'react';
import { MicrophoneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Modal, TagInput, ColorSelector } from '@/components/common';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { useAnnotationStore } from '@/store';
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
      {/* Pannello inline - non overlay */}
      <div className="w-80 flex-shrink-0 bg-white shadow-xl border-l border-gray-200 p-4 overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Nuova annotazione</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Selected text preview */}
        <div className="bg-gray-50 rounded-lg p-2 mb-3 border-l-4" style={{ borderLeftColor: selectedColor }}>
          <p className="text-sm text-gray-700 line-clamp-3">{selection.text}</p>
        </div>

        {/* Color selector */}
        <div className="mb-3">
          <ColorSelector
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>

        {/* Audio memo */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Memo vocale</label>
          {audioMemo ? (
            <div className="flex items-center gap-2 bg-teatro-50 rounded-lg p-2">
              <MicrophoneIcon className="w-4 h-4 text-teatro-600" />
              <span className="text-sm text-teatro-700">
                Registrazione salvata ({Math.round(audioMemo.duration)}s)
              </span>
              <button
                onClick={() => setAudioMemo(null)}
                className="ml-auto text-gray-400 hover:text-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRecorderOpen(true)}
              leftIcon={<MicrophoneIcon className="w-4 h-4" />}
              className="w-full"
            >
              Registra memo vocale
            </Button>
          )}
        </div>

        {/* Tags */}
        <div className="mb-3">
          <TagInput tags={tags} onTagsChange={setTags} />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Note (opzionale)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Aggiungi note..."
            rows={2}
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded resize-none focus:outline-none focus:ring-1 focus:ring-teatro-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveAnnotation} className="flex-1">
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
