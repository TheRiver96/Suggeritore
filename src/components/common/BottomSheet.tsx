import { useEffect, useRef, useState, type ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /**
   * Titolo del bottom sheet
   */
  title?: string;
  /**
   * Altezza iniziale del sheet (default: '60vh')
   */
  initialHeight?: string;
  /**
   * Permetti di trascinare per espandere/comprimere (default: true)
   */
  draggable?: boolean;
}

/**
 * Bottom sheet draggable per mobile (stile Google Maps)
 * Si apre dal basso e può essere trascinato per espanderlo o chiuderlo
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  initialHeight = '60vh',
  draggable = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(initialHeight);

  // Reset height quando si chiude/apre
  useEffect(() => {
    if (isOpen) {
      setSheetHeight(initialHeight);
    }
  }, [isOpen, initialHeight]);

  // Previeni scroll del body quando aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!draggable) return;
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !draggable) return;

    const touchY = e.touches[0].clientY;
    setCurrentY(touchY);

    const deltaY = touchY - startY;

    // Se trascina verso il basso, riduci l'altezza
    if (deltaY > 0) {
      const viewportHeight = window.innerHeight;
      const currentHeightPx = parseFloat(initialHeight) / 100 * viewportHeight;
      const newHeight = Math.max(20, currentHeightPx - deltaY);
      setSheetHeight(`${(newHeight / viewportHeight) * 100}vh`);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !draggable) return;

    const deltaY = currentY - startY;
    const threshold = 100; // px di trascinamento per chiudere

    // Se trascinato abbastanza in basso, chiudi
    if (deltaY > threshold) {
      onClose();
    } else {
      // Altrimenti ritorna all'altezza iniziale
      setSheetHeight(initialHeight);
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={sheetRef}
      className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50 flex flex-col transition-all duration-300"
      style={{
        height: sheetHeight,
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Handle per drag (barra visuale) */}
      {draggable && (
        <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Chiudi"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {children}
      </div>
    </div>
  );
}
