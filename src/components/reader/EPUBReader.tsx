import { useState, useEffect, useRef, useCallback } from 'react';
import ePub, { Book, Rendition, Contents } from 'epubjs';
import { useDocumentStore, useAnnotationStore } from '@/store';
import { useBreakpoints } from '@/hooks';
import { Backdrop, BottomSheet } from '@/components/common';
import { SelectionPopup } from './SelectionPopup';
import { AnnotationEditor } from '@/components/annotations';
import type { Document as TeatroDocument, AnnotationLocation } from '@/types';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';

interface EPUBReaderProps {
  document: TeatroDocument;
}

interface EpubSelection {
  text: string;
  cfi: string;
  range: Range;
}

export function EPUBReader({ document }: EPUBReaderProps) {
  const { zoom, setTotalPages } = useDocumentStore();
  const { loadAnnotations, selectedAnnotation, setSelectedAnnotation, annotations } = useAnnotationStore();
  const { isMobile, isTablet } = useBreakpoints();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<EpubSelection | null>(null);

  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);

  const useMobileLayout = isMobile || isTablet;

  const handleRequestCloseSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const handleRequestCloseEditor = useCallback(() => {
    setSelectedAnnotation(null);
  }, [setSelectedAnnotation]);

  // Gestione click annotazione (future implementation)
  // const handleAnnotationClick = useCallback(
  //   (annotation: Annotation) => {
  //     highlightAnnotationTemporarily(annotation.id, 2500);
  //     setSelectedAnnotation(annotation);

  //     // Naviga alla posizione dell'annotazione
  //     if (annotation.location.cfi && renditionRef.current) {
  //       renditionRef.current.display(annotation.location.cfi);
  //     }
  //   },
  //   [setSelectedAnnotation, highlightAnnotationTemporarily]
  // );

  // Chiudi la modale di modifica quando c'è una nuova selezione di testo
  useEffect(() => {
    if (selection && selectedAnnotation) {
      setSelectedAnnotation(null);
    }
  }, [selection, selectedAnnotation, setSelectedAnnotation]);

  // Inizializza il libro EPUB
  useEffect(() => {
    if (!document.file || !viewerRef.current) return;

    const initEpub = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Crea il libro da blob
        const arrayBuffer = await document.file.arrayBuffer();
        const book = ePub(arrayBuffer);
        bookRef.current = book;

        // Crea il rendition
        const rendition = book.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Carica annotazioni
        await loadAnnotations(document.id);

        // Display del libro
        await rendition.display();

        // Ottieni metadata (opzionale per future implementazioni)
        // const metadata = await book.loaded.metadata;

        // Stima del numero di pagine (approssimativo)
        const spine = await book.loaded.spine;
        setTotalPages(spine.length);

        // Gestisci selezione testo
        rendition.on('selected', (cfiRange: string, contents: Contents) => {
          const range = contents.range(cfiRange);
          const text = range.toString().trim();

          if (text) {
            setSelection({
              text,
              cfi: cfiRange,
              range,
            });
          }
        });

        // Traccia la posizione corrente (opzionale per future implementazioni)
        // rendition.on('relocated', (location: any) => {
        //   setCurrentLocation(location.start.cfi);
        // });

        setIsLoading(false);
      } catch (err) {
        console.error('Errore caricamento EPUB:', err);
        setError('Impossibile caricare il file EPUB');
        setIsLoading(false);
      }
    };

    initEpub();

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [document.id, document.file, loadAnnotations, setTotalPages]);

  // Applica zoom
  useEffect(() => {
    if (renditionRef.current) {
      const fontSize = 100 + (zoom - 1) * 50; // 100% base, +/-50% per ogni step
      renditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [zoom]);

  // Renderizza highlights delle annotazioni
  useEffect(() => {
    if (!renditionRef.current || annotations.length === 0) return;

    // Rimuovi highlights precedenti
    renditionRef.current.annotations.remove('*', 'highlight');

    // Aggiungi nuovi highlights
    annotations.forEach((annotation) => {
      if (annotation.location.cfi) {
        renditionRef.current!.annotations.add(
          'highlight',
          annotation.location.cfi,
          {},
          undefined,
          'epub-annotation',
          { fill: annotation.color, 'fill-opacity': '0.3' }
        );
      }
    });
  }, [annotations]);

  const handlePrevPage = useCallback(() => {
    renditionRef.current?.prev();
  }, []);

  const handleNextPage = useCallback(() => {
    renditionRef.current?.next();
  }, []);

  const handleZoomIn = useCallback(() => {
    useDocumentStore.getState().setZoom(Math.min(zoom + 0.2, 2));
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    useDocumentStore.getState().setZoom(Math.max(zoom - 0.2, 0.5));
  }, [zoom]);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  // Converti selezione EPUB in formato generico per SelectionPopup
  const genericSelection = selection
    ? {
        text: selection.text,
        startOffset: 0,
        endOffset: selection.text.length,
        context: selection.text,
        range: selection.range,
      }
    : null;

  // Crea location per annotazione EPUB
  const createLocation = useCallback(
    (sel: EpubSelection): AnnotationLocation => {
      return {
        cfi: sel.cfi,
        startOffset: 0,
        endOffset: sel.text.length,
      };
    },
    []
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col bg-gray-50">
      {/* Barra di controllo */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={isLoading}
            className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Pagina precedente"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={isLoading}
            className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Pagina successiva"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={isLoading || zoom <= 0.5}
            className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Riduci zoom"
          >
            <MagnifyingGlassMinusIcon className="h-5 w-5" />
          </button>
          <span className="min-w-[4rem] text-center text-sm font-medium">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={isLoading || zoom >= 2}
            className="rounded p-2 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Aumenta zoom"
          >
            <MagnifyingGlassPlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Viewer EPUB */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-teatro-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600">Caricamento EPUB...</p>
            </div>
          </div>
        )}

        <div
          ref={viewerRef}
          className="h-full w-full bg-white"
          style={{ userSelect: 'text' }}
        />
      </div>

      {/* Selection Popup - Desktop/Mobile */}
      {genericSelection && selection && !useMobileLayout && (
        <SelectionPopup
          selection={genericSelection}
          onClose={clearSelection}
          createLocation={() => createLocation(selection)}
        />
      )}

      {/* Selection Popup - BottomSheet Mobile */}
      {genericSelection && selection && useMobileLayout && (
        <>
          <Backdrop isOpen={true} onClose={handleRequestCloseSelection} />
          <BottomSheet isOpen={true} onClose={handleRequestCloseSelection}>
            <SelectionPopup
              selection={genericSelection}
              onClose={clearSelection}
              createLocation={() => createLocation(selection)}
            />
          </BottomSheet>
        </>
      )}

      {/* Annotation Editor - Desktop/Mobile */}
      {selectedAnnotation && !useMobileLayout && (
        <div className="fixed right-0 top-16 z-20 h-[calc(100vh-4rem)] w-96 border-l bg-white shadow-xl">
          <AnnotationEditor
            annotation={selectedAnnotation}
            onClose={() => setSelectedAnnotation(null)}
          />
        </div>
      )}

      {/* Annotation Editor - BottomSheet Mobile */}
      {selectedAnnotation && useMobileLayout && (
        <>
          <Backdrop isOpen={true} onClose={handleRequestCloseEditor} />
          <BottomSheet isOpen={true} onClose={handleRequestCloseEditor}>
            <AnnotationEditor
              annotation={selectedAnnotation}
              onClose={() => setSelectedAnnotation(null)}
            />
          </BottomSheet>
        </>
      )}
    </div>
  );
}
