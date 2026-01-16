import { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { useDocumentStore, useAnnotationStore } from '@/store';
import { useTextSelection, useBreakpoints } from '@/hooks';
import { Backdrop, BottomSheet } from '@/components/common';
import { SelectionPopup } from './SelectionPopup';
import { AnnotationHighlights } from './AnnotationHighlights';
import { AnnotationEditor } from '@/components/annotations';
import type { Document as TeatroDocument, Annotation } from '@/types';

// Configura il worker di PDF.js dalla cartella public
// Usa import.meta.env.BASE_URL per supportare GitHub Pages
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;

interface PDFReaderProps {
  document: TeatroDocument;
}

export function PDFReader({ document }: PDFReaderProps) {
  const { currentPage, zoom, setTotalPages } = useDocumentStore();
  const { loadAnnotations, selectedAnnotation, setSelectedAnnotation } = useAnnotationStore();
  const { isMobile, isTablet } = useBreakpoints();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageRendered, setPageRendered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { selection, clearSelection, hasSelection } = useTextSelection(containerRef);

  const { highlightAnnotationTemporarily } = useAnnotationStore();

  // Su mobile/tablet, usa BottomSheet invece di pannelli laterali
  const useMobileLayout = isMobile || isTablet;

  const handleAnnotationClick = useCallback(
    (annotation: Annotation) => {
      highlightAnnotationTemporarily(annotation.id, 2500);
      setSelectedAnnotation(annotation);
    },
    [setSelectedAnnotation, highlightAnnotationTemporarily]
  );

  // Chiudi la modale di modifica quando c'è una nuova selezione di testo
  useEffect(() => {
    if (hasSelection && selectedAnnotation) {
      setSelectedAnnotation(null);
    }
  }, [hasSelection, selectedAnnotation, setSelectedAnnotation]);

  // Carica il PDF quando il documento cambia
  useEffect(() => {
    if (document.file) {
      const url = URL.createObjectURL(document.file);
      setPdfUrl(url);
      loadAnnotations(document.id);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [document.id, document.file, loadAnnotations]);

  // Reset pageRendered quando cambia pagina o zoom
  useEffect(() => {
    setPageRendered(false);
  }, [currentPage, zoom]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setTotalPages(numPages);
      setIsLoading(false);
      setError(null);
    },
    [setTotalPages]
  );

  const onDocumentLoadError = useCallback((err: Error) => {
    setError(`Errore nel caricamento del PDF: ${err.message}`);
    setIsLoading(false);
  }, []);

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Caricamento documento...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex overflow-hidden">
      {/* Area PDF */}
      <div className="flex-1 flex flex-col items-center overflow-auto bg-gray-200 p-2 sm:p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-teatro-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600">Caricamento PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="text-center p-4">
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-teatro-600 hover:underline"
              >
                Ricarica la pagina
              </button>
            </div>
          </div>
        )}

        <div ref={containerRef} className="relative inline-block">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            <Page
              pageNumber={currentPage}
              scale={zoom}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-xl"
              onRenderSuccess={() => setPageRendered(true)}
            />
          </Document>

          {/* Evidenziazione annotazioni - posizionato sopra il PDF */}
          {pageRendered && !isLoading && (
            <AnnotationHighlights
              containerRef={containerRef}
              currentPage={currentPage}
              onAnnotationClick={handleAnnotationClick}
            />
          )}
        </div>
      </div>

      {/* Desktop: Pannelli laterali fissi */}
      {!useMobileLayout && (
        <>
          {/* Pannello nuova annotazione a destra */}
          {hasSelection && selection && !selectedAnnotation && (
            <SelectionPopup
              selection={selection}
              onClose={clearSelection}
              documentId={document.id}
              currentPage={currentPage}
            />
          )}

          {/* Pannello modifica annotazione a destra */}
          {selectedAnnotation && (
            <AnnotationEditor
              annotation={selectedAnnotation}
              onClose={() => setSelectedAnnotation(null)}
            />
          )}
        </>
      )}

      {/* Mobile/Tablet: BottomSheet con backdrop */}
      {useMobileLayout && (
        <>
          {/* Backdrop per chiudere il bottom sheet */}
          <Backdrop
            isOpen={hasSelection || !!selectedAnnotation}
            onClose={() => {
              clearSelection();
              setSelectedAnnotation(null);
            }}
            zIndex={45}
          />

          {/* BottomSheet per nuova annotazione */}
          {hasSelection && selection && !selectedAnnotation && (
            <BottomSheet
              isOpen={true}
              onClose={clearSelection}
              title="Nuova annotazione"
              initialHeight="70vh"
            >
              <div className="p-4">
                <SelectionPopup
                  selection={selection}
                  onClose={clearSelection}
                  documentId={document.id}
                  currentPage={currentPage}
                />
              </div>
            </BottomSheet>
          )}

          {/* BottomSheet per modifica annotazione */}
          {selectedAnnotation && (
            <BottomSheet
              isOpen={true}
              onClose={() => setSelectedAnnotation(null)}
              title="Modifica annotazione"
              initialHeight="70vh"
            >
              <div className="p-4">
                <AnnotationEditor
                  annotation={selectedAnnotation}
                  onClose={() => setSelectedAnnotation(null)}
                />
              </div>
            </BottomSheet>
          )}
        </>
      )}
    </div>
  );
}
