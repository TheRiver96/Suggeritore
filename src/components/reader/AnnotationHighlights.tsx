import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAnnotationStore } from '@/store';
import type { Annotation } from '@/types';

interface AnnotationHighlightsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentPage: number;
  onAnnotationClick?: (annotation: Annotation) => void;
}

interface HighlightRect {
  annotationId: string;
  color: string;
  title: string;
  rects: { left: number; top: number; width: number; height: number }[];
}

export function AnnotationHighlights({
  containerRef,
  currentPage,
  onAnnotationClick,
}: AnnotationHighlightsProps) {
  // Prendi tutte le annotazioni e l'ID dell'annotazione evidenziata
  const allAnnotations = useAnnotationStore((state) => state.annotations);
  const highlightedAnnotationId = useAnnotationStore((state) => state.highlightedAnnotationId);

  const annotations = useMemo(
    () => allAnnotations.filter((a) => a.location.page === currentPage),
    [allAnnotations, currentPage]
  );

  const [highlights, setHighlights] = useState<HighlightRect[]>([]);
  const annotationsRef = useRef(annotations);

  // Aggiorna il ref quando cambiano le annotazioni
  useEffect(() => {
    annotationsRef.current = annotations;
  }, [annotations]);

  // Funzione per calcolare gli highlight
  const calculateHighlights = useCallback(() => {
    const container = containerRef.current;
    if (!container || annotationsRef.current.length === 0) {
      setHighlights([]);
      return;
    }

    // Cerca il text layer con vari selettori (compatibilità versioni react-pdf)
    const textLayer = container.querySelector('.react-pdf__Page__textContent') ||
                      container.querySelector('[data-main-rotation]') ||
                      container.querySelector('.textLayer');

    // DEBUG
    console.log('[AnnotationHighlights] container:', container);
    console.log('[AnnotationHighlights] textLayer:', textLayer);
    console.log('[AnnotationHighlights] annotations:', annotationsRef.current);

    if (!textLayer) {
      console.warn('[AnnotationHighlights] Text layer non trovato!');
      // Log tutti gli elementi figli per debug
      console.log('[AnnotationHighlights] Container children:', container.innerHTML.substring(0, 500));
      return;
    }

    const textLayerRect = textLayer.getBoundingClientRect();
    const newHighlights: HighlightRect[] = [];

    annotationsRef.current.forEach((annotation) => {
      console.log('[AnnotationHighlights] Cercando testo:', annotation.selectedText);
      const domRects = findTextRects(
        textLayer as HTMLElement,
        annotation.selectedText,
        annotation.textContext
      );
      console.log('[AnnotationHighlights] Trovati rects:', domRects.length, domRects);
      if (domRects.length > 0) {
        newHighlights.push({
          annotationId: annotation.id,
          color: annotation.color,
          title: annotation.notes || annotation.selectedText.substring(0, 50),
          rects: domRects.map((rect) => ({
            // Posizione relativa al text layer
            left: rect.left - textLayerRect.left,
            top: rect.top - textLayerRect.top,
            width: rect.width,
            height: rect.height,
          })),
        });
      }
    });

    setHighlights(newHighlights);
  }, [containerRef]);

  // Calcola le posizioni degli highlight
  useEffect(() => {
    const container = containerRef.current;
    if (!container || annotations.length === 0) {
      setHighlights([]);
      return;
    }

    // Attendi che il text layer sia completamente renderizzato
    const timeout = setTimeout(calculateHighlights, 500);

    // Osserva cambiamenti nel DOM per rilevare quando il text layer è pronto
    const observer = new MutationObserver(() => {
      setTimeout(calculateHighlights, 100);
    });
    observer.observe(container, { childList: true, subtree: true });

    // Listener per resize
    const handleResize = () => {
      setTimeout(calculateHighlights, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, annotations.length, currentPage, calculateHighlights]);

  // Funzione per gestire il click
  const handleClick = (e: React.MouseEvent, annotationId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const annotation = annotationsRef.current.find((a) => a.id === annotationId);
    if (annotation && onAnnotationClick) {
      onAnnotationClick(annotation);
    }
  };

  if (highlights.length === 0) return null;

  // Trova il text layer per posizionare gli highlight correttamente
  const container = containerRef.current;
  const textLayer = container?.querySelector('.react-pdf__Page__textContent') ||
                    container?.querySelector('[data-main-rotation]') ||
                    container?.querySelector('.textLayer');

  if (!textLayer) return null;

  // Calcola l'offset del text layer rispetto al container
  const containerRect = container?.getBoundingClientRect();
  const textLayerRect = textLayer.getBoundingClientRect();
  const offsetLeft = containerRect ? textLayerRect.left - containerRect.left : 0;
  const offsetTop = containerRect ? textLayerRect.top - containerRect.top : 0;

  return (
    <div
      className="absolute"
      style={{
        left: offsetLeft,
        top: offsetTop,
        width: textLayerRect.width,
        height: textLayerRect.height,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {highlights.map((highlight) => {
        const isHighlighted = highlight.annotationId === highlightedAnnotationId;
        return highlight.rects.map((rect, idx) => (
          <div
            key={`${highlight.annotationId}-${idx}`}
            role="button"
            tabIndex={0}
            aria-label={`Annotazione: ${highlight.title.substring(0, 50)}`}
            className={`absolute cursor-pointer transition-all ${
              isHighlighted ? 'annotation-highlight-pulse' : ''
            }`}
            style={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              backgroundColor: highlight.color,
              opacity: isHighlighted ? 0.7 : 0.4,
              mixBlendMode: 'multiply',
              borderRadius: '2px',
              boxShadow: isHighlighted ? `0 0 8px 2px ${highlight.color}` : 'none',
              pointerEvents: 'auto',
              zIndex: 11,
            }}
            onClick={(e) => handleClick(e, highlight.annotationId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(e as unknown as React.MouseEvent, highlight.annotationId);
              }
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.opacity = '0.6';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.opacity = isHighlighted ? '0.7' : '0.4';
            }}
            title={highlight.title}
          />
        ));
      })}
    </div>
  );
}

/**
 * Cerca il testo nel text layer e restituisce i rettangoli dell'occorrenza corretta
 * Usa Range API per calcolare i bounds esatti del testo selezionato
 * Usa textContext per disambiguare tra occorrenze multiple dello stesso testo
 */
function findTextRects(textLayer: HTMLElement, searchText: string, textContext?: string): DOMRect[] {
  const rects: DOMRect[] = [];

  // Costruisci una mappa del testo usando TreeWalker per ottenere tutti i text node
  let fullText = '';
  const textNodeMap: { start: number; end: number; textNode: Text }[] = [];

  const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    const text = node.textContent || '';
    if (text.length > 0) {
      const start = fullText.length;
      fullText += text;
      textNodeMap.push({ start, end: fullText.length, textNode: node });
    }
  }

  // Normalizza carattere per carattere e crea una mappa indice normalizzato -> indice originale
  const normalizeChar = (char: string) => {
    // Normalizza apostrofi e virgolette
    if (/[\u2018\u2019\u201C\u201D'`]/.test(char)) return "'";
    return char.toLowerCase();
  };

  // Costruisci testo normalizzato con mappa degli indici
  let normalizedText = '';
  const indexMap: number[] = []; // indexMap[normalizedIdx] = originalIdx

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const normalized = normalizeChar(char);

    // Salta spazi multipli (mantieni solo uno spazio)
    if (/\s/.test(char)) {
      if (normalizedText.length > 0 && normalizedText[normalizedText.length - 1] !== ' ') {
        normalizedText += ' ';
        indexMap.push(i);
      }
    } else {
      normalizedText += normalized;
      indexMap.push(i);
    }
  }

  // Normalizza il testo di ricerca allo stesso modo
  let normalizedSearch = '';
  for (let i = 0; i < searchText.length; i++) {
    const char = searchText[i];
    const normalized = normalizeChar(char);
    if (/\s/.test(char)) {
      if (normalizedSearch.length > 0 && normalizedSearch[normalizedSearch.length - 1] !== ' ') {
        normalizedSearch += ' ';
      }
    } else {
      normalizedSearch += normalized;
    }
  }
  normalizedSearch = normalizedSearch.trim();

  // Crea anche versioni senza spazi per match più robusto
  const noSpaceText = normalizedText.replace(/ /g, '');
  const noSpaceSearch = normalizedSearch.replace(/ /g, '');

  // Mappa indice noSpace -> indice normalizedText
  const noSpaceToNormalized: number[] = [];
  for (let i = 0; i < normalizedText.length; i++) {
    if (normalizedText[i] !== ' ') {
      noSpaceToNormalized.push(i);
    }
  }

  // DEBUG
  console.log('[findTextRects] normalizedSearch:', normalizedSearch.substring(0, 80));
  console.log('[findTextRects] noSpaceSearch:', noSpaceSearch.substring(0, 80));

  // Cerca nel testo normalizzato
  const occurrences: { normalizedIdx: number; originalStart: number; originalEnd: number }[] = [];
  let searchStart = 0;

  // Prima prova ricerca esatta
  while (true) {
    const idx = normalizedText.indexOf(normalizedSearch, searchStart);
    if (idx === -1) break;

    const originalStart = indexMap[idx];
    const endNormalizedIdx = idx + normalizedSearch.length - 1;
    const originalEnd = endNormalizedIdx < indexMap.length
      ? indexMap[endNormalizedIdx] + 1
      : fullText.length;

    occurrences.push({ normalizedIdx: idx, originalStart, originalEnd });
    searchStart = idx + 1;
  }

  // Se non trova nulla, prova senza spazi (per PDF che uniscono le righe)
  if (occurrences.length === 0) {
    console.log('[findTextRects] Tentativo ricerca senza spazi...');
    searchStart = 0;

    while (true) {
      const idx = noSpaceText.indexOf(noSpaceSearch, searchStart);
      if (idx === -1) break;

      // Mappa indice noSpace -> normalizedText -> original
      const normalizedStartIdx = noSpaceToNormalized[idx];
      const normalizedEndIdx = noSpaceToNormalized[idx + noSpaceSearch.length - 1];

      if (normalizedStartIdx !== undefined && normalizedEndIdx !== undefined) {
        const originalStart = indexMap[normalizedStartIdx];
        const originalEnd = indexMap[normalizedEndIdx] + 1;

        occurrences.push({ normalizedIdx: normalizedStartIdx, originalStart, originalEnd });
        console.log('[findTextRects] Match senza spazi trovato:', originalStart, '-', originalEnd);
      }
      searchStart = idx + 1;
    }
  }

  console.log('[findTextRects] Occorrenze trovate:', occurrences.length);

  // Se ancora non trova nulla, prova fuzzy con le prime parole
  if (occurrences.length === 0) {
    const firstWordsNoSpace = noSpaceSearch.substring(0, 30);
    console.log('[findTextRects] Tentativo fuzzy con:', firstWordsNoSpace);

    const fuzzyIdx = noSpaceText.indexOf(firstWordsNoSpace);
    if (fuzzyIdx !== -1) {
      const normalizedStartIdx = noSpaceToNormalized[fuzzyIdx];
      const normalizedEndIdx = noSpaceToNormalized[fuzzyIdx + firstWordsNoSpace.length - 1];

      if (normalizedStartIdx !== undefined && normalizedEndIdx !== undefined) {
        const originalStart = indexMap[normalizedStartIdx];
        const originalEnd = indexMap[normalizedEndIdx] + 1;
        occurrences.push({ normalizedIdx: normalizedStartIdx, originalStart, originalEnd });
        console.log('[findTextRects] Fuzzy match trovato:', originalStart, '-', originalEnd);
      }
    }
  }

  if (occurrences.length === 0) {
    return rects;
  }

  // Scegli l'occorrenza migliore usando il contesto
  let bestOccurrence = occurrences[0];

  if (occurrences.length > 1 && textContext) {
    const normalizedContext = textContext.toLowerCase().replace(/\s+/g, ' ');
    let bestScore = -1;

    for (const occ of occurrences) {
      const contextStart = Math.max(0, occ.originalStart - 50);
      const contextEnd = Math.min(fullText.length, occ.originalEnd + 50);
      const localContext = fullText.substring(contextStart, contextEnd).toLowerCase();

      const score = calculateContextSimilarity(localContext, normalizedContext);
      if (score > bestScore) {
        bestScore = score;
        bestOccurrence = occ;
      }
    }
  }

  console.log('[findTextRects] Usando occorrenza:', bestOccurrence.originalStart, '-', bestOccurrence.originalEnd);
  console.log('[findTextRects] Testo trovato:', fullText.substring(bestOccurrence.originalStart, bestOccurrence.originalEnd));

  // Usa Range API per ottenere i bounds esatti
  const range = document.createRange();
  let rangeSet = false;

  for (const { start, end, textNode } of textNodeMap) {
    if (start >= bestOccurrence.originalEnd || end <= bestOccurrence.originalStart) continue;

    const textLength = textNode.length;
    const localStart = Math.max(0, bestOccurrence.originalStart - start);
    const localEnd = Math.min(textLength, bestOccurrence.originalEnd - start);

    if (localStart >= localEnd || localStart >= textLength) continue;

    try {
      if (!rangeSet) {
        range.setStart(textNode, localStart);
        rangeSet = true;
      }
      range.setEnd(textNode, localEnd);
    } catch (e) {
      console.warn('[findTextRects] Errore setRange:', e);
      continue;
    }
  }

  if (rangeSet) {
    const clientRects = range.getClientRects();
    console.log('[findTextRects] ClientRects trovati:', clientRects.length);
    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects[i];
      if (rect.width > 0 && rect.height > 0) {
        rects.push(rect);
      }
    }
  }

  return rects;
}

/**
 * Calcola la similarità tra due stringhe di contesto
 * Restituisce un punteggio da 0 a 1
 */
function calculateContextSimilarity(context1: string, context2: string): number {
  if (!context1 || !context2) return 0;

  // Usa la lunghezza della sottostringa comune più lunga come metrica
  const shorter = context1.length < context2.length ? context1 : context2;
  const longer = context1.length < context2.length ? context2 : context1;

  // Conta quanti caratteri di shorter sono contenuti in longer nella stessa sequenza
  let matches = 0;
  let longerIndex = 0;

  for (let i = 0; i < shorter.length && longerIndex < longer.length; i++) {
    const char = shorter[i];
    const foundIndex = longer.indexOf(char, longerIndex);
    if (foundIndex !== -1) {
      matches++;
      longerIndex = foundIndex + 1;
    }
  }

  return matches / shorter.length;
}

