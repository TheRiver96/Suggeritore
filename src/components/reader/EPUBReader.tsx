import { useState, useEffect, useRef, useCallback } from 'react';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import type { Rendition, Contents, NavItem } from 'epubjs';
import { useDocumentStore, useAnnotationStore } from '@/store';
import { useBreakpoints } from '@/hooks';
import { Backdrop, BottomSheet } from '@/components/common';
import { SelectionPopup } from './SelectionPopup';
import { AnnotationEditor } from '@/components/annotations';
import type { Document as TeatroDocument, AnnotationLocation } from '@/types';

interface EPUBReaderProps {
  document: TeatroDocument;
}

interface EpubSelection {
  text: string;
  cfi: string;
  range: Range;
}

export function EPUBReader({ document }: EPUBReaderProps) {
  const { zoom, setTotalPages, currentPage } = useDocumentStore();
  const { loadAnnotations, selectedAnnotation, setSelectedAnnotation, annotations } = useAnnotationStore();
  const { isMobile, isTablet } = useBreakpoints();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string | number>(0);
  const [selection, setSelection] = useState<EpubSelection | null>(null);
  const [bookData, setBookData] = useState<ArrayBuffer | null>(null);

  const renditionRef = useRef<Rendition | null>(null);
  const annotationsRef = useRef(annotations);
  const toc = useRef<NavItem[]>([]);

  const useMobileLayout = isMobile || isTablet;

  // Mantieni il ref sincronizzato con le annotazioni
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  // Ref per accedere al metodo handleClose dei componenti figli
  const selectionPopupHandleCloseRef = useRef<(() => void) | null>(null);
  const annotationEditorHandleCloseRef = useRef<(() => void) | null>(null);

  const handleRequestCloseSelection = useCallback(() => {
    if (selectionPopupHandleCloseRef.current) {
      selectionPopupHandleCloseRef.current();
    } else {
      setSelection(null);
    }
  }, []);

  const handleRequestCloseEditor = useCallback(() => {
    if (annotationEditorHandleCloseRef.current) {
      annotationEditorHandleCloseRef.current();
    } else {
      setSelectedAnnotation(null);
    }
  }, [setSelectedAnnotation]);

  // Chiudi la modale di modifica quando c'è una nuova selezione di testo
  useEffect(() => {
    if (selection && selectedAnnotation) {
      setSelectedAnnotation(null);
    }
  }, [selection, selectedAnnotation, setSelectedAnnotation]);

  // Inizializza il libro EPUB
  useEffect(() => {
    if (!document.file) return;

    const initEpub = async () => {
      try {
        setIsLoading(true);

        // Converti il file in ArrayBuffer per react-reader
        const arrayBuffer = await document.file.arrayBuffer();
        setBookData(arrayBuffer);

        // Carica annotazioni
        await loadAnnotations(document.id);

        setIsLoading(false);
      } catch {
        setError('Impossibile caricare il file EPUB. Verifica che il file sia valido.');
        setIsLoading(false);
      }
    };

    initEpub();
  }, [document.id, document.file, loadAnnotations]);

  // Callback quando il rendition è pronto
  const onRenditionReady = useCallback(
    (rendition: Rendition) => {
      renditionRef.current = rendition;

      // Disabilita menu contestuale (tasto destro) nel contenuto EPUB
      rendition.on('rendered', (_section: unknown, view?: { document?: Document }) => {
        if (view?.document) {
          view.document.addEventListener('contextmenu', (e: Event) => {
            e.preventDefault();
          });
        }
      });

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

      // Applica highlights alle annotazioni
      const currentAnnotations = annotationsRef.current;
      if (currentAnnotations.length > 0) {
        currentAnnotations.forEach((annotation) => {
          if (annotation.location.cfi) {
            rendition.annotations.add(
              'highlight',
              annotation.location.cfi,
              {},
              undefined,
              'epub-annotation',
              {
                fill: annotation.color,
                'fill-opacity': '0.3',
                'pointer-events': 'all'
              }
            );
          }
        });
      }

      // Aggiungi stile CSS per il cursore pointer sugli highlights
      rendition.hooks.content.register((contents: Contents) => {
        const style = contents.document.createElement('style');
        style.textContent = `
          .epub-annotation {
            cursor: pointer !important;
          }
        `;
        contents.document.head.appendChild(style);
      });

      // Gestisci click su highlights (annotazioni esistenti)
      rendition.on('markClicked', (cfiRange: string) => {
        // Trova l'annotazione corrispondente al CFI
        const clickedAnnotation = annotationsRef.current.find((ann) => ann.location.cfi === cfiRange);

        if (clickedAnnotation) {
          // Chiudi eventuale selezione aperta
          setSelection(null);

          // Apri l'editor con l'annotazione cliccata
          setSelectedAnnotation(clickedAnnotation);
        }
      });

      // Carica la TOC
      rendition.book.loaded.navigation.then((navigation) => {
        toc.current = navigation.toc;
        setTotalPages(navigation.toc.length);
      });
    },
    [setTotalPages, setSelectedAnnotation]
  );

  // Aggiorna highlights quando le annotazioni cambiano
  useEffect(() => {
    if (!renditionRef.current) return;

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
          {
            fill: annotation.color,
            'fill-opacity': '0.3',
            'pointer-events': 'all'
          }
        );
      }
    });
  }, [annotations]);

  // Naviga all'annotazione selezionata
  useEffect(() => {
    if (!renditionRef.current || !selectedAnnotation) return;

    const cfi = selectedAnnotation.location.cfi;
    if (cfi) {
      renditionRef.current.display(cfi);
    }
  }, [selectedAnnotation]);

  // Applica zoom
  useEffect(() => {
    if (renditionRef.current) {
      const fontSize = 100 + (zoom - 1) * 50; // 100% base, +/-50% per ogni step
      renditionRef.current.themes.fontSize(`${fontSize}%`);
    }
  }, [zoom]);

  // Gestisci cambio pagina da Header (prev/next)
  useEffect(() => {
    if (!renditionRef.current || currentPage === 0) return;

    // Naviga alla sezione corrispondente usando l'indice della TOC
    if (toc.current && toc.current.length > 0) {
      const targetIndex = currentPage - 1;
      const tocItem = toc.current[targetIndex];

      if (tocItem && tocItem.href) {
        setLocation(tocItem.href);
      }
    }
  }, [currentPage]);

  // Callback per tracciare la posizione corrente
  const onLocationChanged = useCallback(() => {
    // react-reader gestisce automaticamente la navigazione
    // Non dobbiamo aggiornare manualmente currentPage qui per evitare loop
  }, []);


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

  // Custom styles per react-reader - nascondi frecce di navigazione e menu TOC
  const readerStyles: typeof ReactReaderStyle = {
    ...ReactReaderStyle,
    arrow: {
      ...ReactReaderStyle.arrow,
      display: 'none', // Nascondi frecce di navigazione
    },
    arrowHover: {
      ...ReactReaderStyle.arrowHover,
      display: 'none',
    },
    tocArea: {
      ...ReactReaderStyle.tocArea,
      display: 'none', // Nascondi menu TOC in alto a sinistra
    },
    tocButton: {
      ...ReactReaderStyle.tocButton,
      display: 'none', // Nascondi pulsante TOC
    },
    tocButtonExpanded: {
      ...ReactReaderStyle.tocButtonExpanded,
      display: 'none',
    },
    readerArea: {
      ...ReactReaderStyle.readerArea,
      transition: undefined, // Rimuovi transizione quando le frecce sono nascoste
    },
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 text-sm bg-teatro-600 text-white rounded-lg hover:bg-teatro-700 transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-teatro-600 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Caricamento EPUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex overflow-hidden">
      {/* Area EPUB */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <div className="text-center">
              <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-teatro-600 border-t-transparent"></div>
              <p className="text-sm text-gray-600">Caricamento EPUB...</p>
            </div>
          </div>
        )}

        <ReactReader
          url={bookData}
          location={location}
          locationChanged={onLocationChanged}
          getRendition={onRenditionReady}
          epubOptions={{
            flow: 'scrolled-doc',
            manager: 'default',
          }}
          readerStyles={readerStyles}
        />
      </div>

      {/* Desktop: Pannelli laterali fissi */}
      {!useMobileLayout && (
        <>
          {/* Pannello nuova annotazione a destra */}
          {genericSelection && selection && !selectedAnnotation && (
            <SelectionPopup
              selection={genericSelection}
              onClose={clearSelection}
              createLocation={() => createLocation(selection)}
              handleCloseRef={selectionPopupHandleCloseRef}
            />
          )}

          {/* Pannello modifica annotazione a destra */}
          {selectedAnnotation && (
            <AnnotationEditor
              annotation={selectedAnnotation}
              onClose={() => setSelectedAnnotation(null)}
              handleCloseRef={annotationEditorHandleCloseRef}
            />
          )}
        </>
      )}

      {/* Mobile/Tablet: BottomSheet con backdrop */}
      {useMobileLayout && (
        <>
          {/* Backdrop per chiudere il bottom sheet */}
          <Backdrop
            isOpen={(!!genericSelection && !!selection) || !!selectedAnnotation}
            onClose={() => {
              if (genericSelection && selection) {
                handleRequestCloseSelection();
              } else if (selectedAnnotation) {
                handleRequestCloseEditor();
              }
            }}
            zIndex={45}
          />

          {/* BottomSheet per nuova annotazione */}
          {genericSelection && selection && !selectedAnnotation && (
            <BottomSheet
              isOpen={true}
              onClose={handleRequestCloseSelection}
              title="Nuova annotazione"
              initialHeight="70vh"
            >
              <div className="p-4">
                <SelectionPopup
                  selection={genericSelection}
                  onClose={clearSelection}
                  createLocation={() => createLocation(selection)}
                  handleCloseRef={selectionPopupHandleCloseRef}
                />
              </div>
            </BottomSheet>
          )}

          {/* BottomSheet per modifica annotazione */}
          {selectedAnnotation && (
            <BottomSheet
              isOpen={true}
              onClose={handleRequestCloseEditor}
              title="Modifica annotazione"
              initialHeight="70vh"
            >
              <div className="p-4">
                <AnnotationEditor
                  annotation={selectedAnnotation}
                  onClose={() => setSelectedAnnotation(null)}
                  handleCloseRef={annotationEditorHandleCloseRef}
                />
              </div>
            </BottomSheet>
          )}
        </>
      )}
    </div>
  );
}
