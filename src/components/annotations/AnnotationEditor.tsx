import { useState, useEffect, useMemo, useRef } from 'react';
import { XMarkIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import { Button, Modal, ConfirmModal, TagInput, ColorSelector } from '@/components/common';
import { VoiceRecorder } from '@/components/audio/VoiceRecorder';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { useAnnotationStore } from '@/store';
import { useBreakpoints, useTagNames } from '@/hooks';
import type { Annotation, AudioMemo } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AnnotationEditorProps {
  annotation: Annotation;
  onClose: () => void;
  /** Ref per esporre handleClose al parent (per BottomSheet) */
  handleCloseRef?: React.MutableRefObject<(() => void) | null>;
}

export function AnnotationEditor({ annotation, onClose, handleCloseRef }: AnnotationEditorProps) {
  const [tags, setTags] = useState<string[]>(annotation.tags);
  const [notes, setNotes] = useState(annotation.notes || '');
  const [selectedColor, setSelectedColor] = useState(annotation.color);
  const [audioMemo, setAudioMemo] = useState<AudioMemo | undefined>(annotation.audioMemo);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<Annotation | null>(null);

  const { updateAnnotation } = useAnnotationStore();
  const { isMobile, isTablet } = useBreakpoints();
  const useMobileLayout = isMobile || isTablet;
  const existingTags = useTagNames();

  // Ref per tenere traccia dell'ID corrente
  const currentAnnotationIdRef = useRef(annotation.id);

  // Intercetta il cambio di annotazione e chiedi conferma se ci sono modifiche
  useEffect(() => {
    // Se l'ID è cambiato e non è il primo render
    if (annotation.id !== currentAnnotationIdRef.current) {
      const tagsChanged = JSON.stringify(tags.sort()) !== JSON.stringify(annotation.tags.sort());
      const notesChanged = (notes || '') !== (annotation.notes || '');
      const colorChanged = selectedColor !== annotation.color;
      const audioChanged = audioMemo?.id !== annotation.audioMemo?.id;
      const hasChanges = tagsChanged || notesChanged || colorChanged || audioChanged;

      if (hasChanges) {
        // Salva l'annotazione in arrivo e mostra conferma
        setPendingAnnotation(annotation);
        setShowConfirmSwitch(true);
        return; // Non aggiornare lo stato ancora
      }
    }

    // Aggiorna lo stato solo se non ci sono modifiche o è il primo render
    currentAnnotationIdRef.current = annotation.id;
    setTags(annotation.tags);
    setNotes(annotation.notes || '');
    setSelectedColor(annotation.color);
    setAudioMemo(annotation.audioMemo);
    setPendingAnnotation(null);
  }, [annotation]);

  // Rileva se ci sono modifiche non salvate
  const hasChanges = useMemo(() => {
    // Confronta tags
    const tagsChanged = JSON.stringify(tags.sort()) !== JSON.stringify(annotation.tags.sort());

    // Confronta notes
    const notesChanged = (notes || '') !== (annotation.notes || '');

    // Confronta color
    const colorChanged = selectedColor !== annotation.color;

    // Confronta audioMemo (confronto per ID o presenza)
    const audioChanged = audioMemo?.id !== annotation.audioMemo?.id;

    return tagsChanged || notesChanged || colorChanged || audioChanged;
  }, [tags, notes, selectedColor, audioMemo, annotation]);

  const handleRecordingComplete = (blob: Blob, duration: number, mimeType: string) => {
    setAudioMemo({
      id: uuidv4(),
      blob,
      duration,
      mimeType,
    });
    setIsRecorderOpen(false);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    await updateAnnotation({
      ...annotation,
      tags,
      notes: notes || undefined,
      color: selectedColor,
      audioMemo,
    });
    onClose();
  };

  const handleSaveAndClose = async () => {
    await handleSave();
  };

  const handleDiscardAndClose = () => {
    onClose();
  };

  const handleSaveAndSwitch = async () => {
    if (pendingAnnotation) {
      await handleSave();
      // Dopo aver salvato, permetti il cambio
      currentAnnotationIdRef.current = pendingAnnotation.id;
      setTags(pendingAnnotation.tags);
      setNotes(pendingAnnotation.notes || '');
      setSelectedColor(pendingAnnotation.color);
      setAudioMemo(pendingAnnotation.audioMemo);
      setPendingAnnotation(null);
    }
  };

  const handleDiscardAndSwitch = () => {
    if (pendingAnnotation) {
      // Scarta le modifiche e passa alla nuova annotazione
      currentAnnotationIdRef.current = pendingAnnotation.id;
      setTags(pendingAnnotation.tags);
      setNotes(pendingAnnotation.notes || '');
      setSelectedColor(pendingAnnotation.color);
      setAudioMemo(pendingAnnotation.audioMemo);
      setPendingAnnotation(null);
    }
  };

  // Esponi handleClose al parent tramite ref
  useEffect(() => {
    if (handleCloseRef) {
      handleCloseRef.current = handleClose;
    }
    return () => {
      if (handleCloseRef) {
        handleCloseRef.current = null;
      }
    };
  }, [handleClose, handleCloseRef]);

  return (
    <>
      {/* Contenuto - stile cambia in base a desktop/mobile */}
      <div className={useMobileLayout ? '' : 'w-80 flex-shrink-0 bg-white shadow-xl border-l border-gray-200 p-4 overflow-y-auto'}>
        {/* Header - solo su desktop (su mobile è nel BottomSheet) */}
        {!useMobileLayout && (
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Modifica annotazione</h3>
            <button
              onClick={handleClose}
              className="p-2 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <XMarkIcon className="w-5 h-5 transition-transform duration-200" />
            </button>
          </div>
        )}

        {/* Selected text preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border-l-4" style={{ borderLeftColor: selectedColor }}>
          <p className={`text-gray-700 line-clamp-3 ${useMobileLayout ? 'text-base' : 'text-sm'}`}>
            {annotation.selectedText}
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
          {audioMemo?.blob ? (
            <div className="space-y-3">
              <AudioPlayer key={audioMemo.id} audioBlob={audioMemo.blob} duration={audioMemo.duration} />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size={useMobileLayout ? 'md' : 'sm'}
                  onClick={() => setAudioMemo(undefined)}
                  className="flex-1"
                >
                  Rimuovi
                </Button>
                <Button
                  variant="secondary"
                  size={useMobileLayout ? 'md' : 'sm'}
                  onClick={() => setIsRecorderOpen(true)}
                  leftIcon={<MicrophoneIcon className={useMobileLayout ? 'w-5 h-5' : 'w-4 h-4'} />}
                  className="flex-1"
                >
                  Sostituisci
                </Button>
              </div>
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
          <TagInput tags={tags} onTagsChange={setTags} existingTags={existingTags} />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className={`font-medium text-gray-500 mb-2 block ${useMobileLayout ? 'text-sm' : 'text-xs'}`}>
            Note
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
            onClick={handleClose}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            variant="primary"
            size={useMobileLayout ? 'md' : 'sm'}
            onClick={handleSave}
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

      {/* Confirm Close Modal */}
      <ConfirmModal
        isOpen={showConfirmClose}
        onClose={() => setShowConfirmClose(false)}
        onConfirm={handleDiscardAndClose}
        onSave={handleSaveAndClose}
        title="Modifiche non salvate"
        message="Hai apportato modifiche all'annotazione. Vuoi salvare prima di chiudere?"
        confirmText="Chiudi senza salvare"
        saveText="Salva"
        cancelText="Annulla"
        variant="warning"
      />

      {/* Confirm Switch Modal */}
      <ConfirmModal
        isOpen={showConfirmSwitch}
        onClose={() => {
          setShowConfirmSwitch(false);
          setPendingAnnotation(null);
        }}
        onConfirm={handleDiscardAndSwitch}
        onSave={handleSaveAndSwitch}
        title="Modifiche non salvate"
        message="Hai modifiche non salvate. Vuoi salvare prima di passare a un'altra annotazione?"
        confirmText="Cambia senza salvare"
        saveText="Salva e cambia"
        cancelText="Annulla"
        variant="warning"
      />
    </>
  );
}
