import { useEffect } from 'react';

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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black transition-opacity duration-300"
      style={{
        zIndex,
        opacity: isOpen ? opacity : 0,
      }}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}
