import { useEffect } from 'react';
import { lockScroll, unlockScroll } from '@/utils/bodyScrollLock';

interface BackdropProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Z-index del backdrop (default: 40)
   */
  zIndex?: number;
  /**
   * Opacità del backdrop (default: 0.5)
   */
  opacity?: number;
}

/**
 * Backdrop overlay per drawer, modal e bottom sheet
 * Usato principalmente su mobile per chiudere drawer/sheet toccando l'overlay
 */
export function Backdrop({ isOpen, onClose, zIndex = 40, opacity = 0.5 }: BackdropProps) {
  // Previeni scroll del body quando il backdrop è aperto
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    }
    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black transition-opacity duration-300 ease-in-out"
      style={{
        zIndex,
        opacity: isOpen ? opacity : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
