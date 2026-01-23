import { useState, useCallback, useEffect, useRef } from 'react';

export interface TextSelectionData {
  text: string;
  startOffset: number;
  endOffset: number;
  context: string;
  range: Range | null;
}

export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>) {
  const [selection, setSelection] = useState<TextSelectionData | null>(null);
  const pendingSelectionRef = useRef<number | null>(null);

  const getSelectionContext = useCallback(
    (range: Range, contextLength: number = 50): string => {
      const selectedText = range.toString();
      const container = containerRef.current;
      if (!container) return selectedText;

      // Usa TreeWalker per trovare la posizione ESATTA della selezione nel testo
      const textContent = container.textContent || '';

      // Calcola l'offset reale della selezione nel testo completo
      // Cammina attraverso tutti i text node fino a trovare quello che contiene l'inizio del range
      let currentOffset = 0;
      let selectionStartOffset = -1;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node: Text | null;

      while ((node = walker.nextNode() as Text | null)) {
        // Controlla se questo è il nodo di inizio del range
        if (node === range.startContainer) {
          selectionStartOffset = currentOffset + range.startOffset;
          break;
        }
        currentOffset += node.length;
      }

      // Se non abbiamo trovato l'offset, usa Range per calcolare la posizione esatta
      if (selectionStartOffset === -1) {
        try {
          const preRange = document.createRange();
          preRange.setStart(container, 0);
          preRange.setEnd(range.startContainer, range.startOffset);
          selectionStartOffset = preRange.toString().length;
        } catch {
          // Fallback a indexOf se Range fallisce
          const index = textContent.indexOf(selectedText);
          if (index === -1) return selectedText;
          selectionStartOffset = index;
        }
      }

      const start = Math.max(0, selectionStartOffset - contextLength);
      const end = Math.min(textContent.length, selectionStartOffset + selectedText.length + contextLength);

      return textContent.slice(start, end);
    },
    [containerRef]
  );

  const handleSelection = useCallback((event: MouseEvent | KeyboardEvent | TouchEvent) => {
    // Ignora click su elementi interattivi (input, textarea, button) per evitare
    // che la modale si chiuda quando l'utente clicca sui campi
    const target = event.target as HTMLElement;

    // Verifica che il target sia un HTMLElement con i metodi necessari
    if (!target || typeof target.closest !== 'function') {
      return;
    }

    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.closest('button')) {
      return;
    }

    // Ignora click sugli highlight delle annotazioni
    if (target.closest('.annotation-highlight-pulse') || target.classList.contains('pointer-events-auto')) {
      return;
    }

    // Su touch, aggiungi un piccolo delay per permettere alla selezione nativa di completarsi
    const checkSelection = () => {
      const windowSelection = window.getSelection();
      if (!windowSelection || windowSelection.isCollapsed) {
        setSelection(null);
        return;
      }

      const range = windowSelection.getRangeAt(0);
      const text = windowSelection.toString().trim();

      if (!text) {
        setSelection(null);
        return;
      }

      // Verifica che la selezione sia all'interno del container
      const container = containerRef.current;
      if (container && !container.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }

      const context = getSelectionContext(range);

      setSelection({
        text,
        startOffset: range.startOffset,
        endOffset: range.endOffset,
        context,
        range: range.cloneRange(),
      });
    };

    // Su dispositivi touch, aggiungi un delay per permettere alla selezione di completarsi
    if (event.type === 'touchend') {
      setTimeout(checkSelection, 100);
    } else {
      checkSelection();
    }
  }, [containerRef, getSelectionContext]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  useEffect(() => {
    // Gate con requestAnimationFrame per evitare processamenti duplicati
    const scheduleSelection = (e: Event) => {
      if (pendingSelectionRef.current) {
        cancelAnimationFrame(pendingSelectionRef.current);
      }
      pendingSelectionRef.current = requestAnimationFrame(() => {
        pendingSelectionRef.current = null;
        handleSelection(e as MouseEvent);
      });
    };

    const mouseHandler = (e: MouseEvent) => scheduleSelection(e);
    const keyHandler = (e: KeyboardEvent) => scheduleSelection(e);
    const touchHandler = (e: TouchEvent) => handleSelection(e); // touch mantiene il delay interno
    const selectionHandler = (e: Event) => scheduleSelection(e);

    // Ascolta sia eventi mouse che touch per supportare desktop e mobile
    document.addEventListener('mouseup', mouseHandler);
    document.addEventListener('keyup', keyHandler);
    document.addEventListener('touchend', touchHandler);

    // Su mobile, controlla anche quando cambia la selezione
    document.addEventListener('selectionchange', selectionHandler);

    return () => {
      if (pendingSelectionRef.current) {
        cancelAnimationFrame(pendingSelectionRef.current);
      }
      document.removeEventListener('mouseup', mouseHandler);
      document.removeEventListener('keyup', keyHandler);
      document.removeEventListener('touchend', touchHandler);
      document.removeEventListener('selectionchange', selectionHandler);
    };
  }, [handleSelection]);

  return {
    selection,
    clearSelection,
    hasSelection: selection !== null,
  };
}
