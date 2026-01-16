import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Se true, impedisce la chiusura cliccando fuori o premendo Escape */
  preventClose?: boolean;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', preventClose = false }: ModalProps) {
  // Gestione tasto Escape
  useEffect(() => {
    if (!isOpen || preventClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, preventClose]);

  // Blocca scroll del body quando la modale è aperta
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Chiudi solo se il click è direttamente sul backdrop (non sui figli)
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  const handlePanelClick = (e: React.MouseEvent) => {
    // Ferma la propagazione per evitare che il click arrivi al backdrop
    e.stopPropagation();
  };

  // Usa createPortal per renderizzare la Modal direttamente nel body,
  // così sfugge a qualsiasi contesto di stacking dei componenti genitori
  return createPortal(
    <div className="fixed inset-0 z-50 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out"
        style={{ opacity: isOpen ? 1 : 0 }}
        onClick={handleBackdropClick}
      />

      {/* Container centrato */}
      <div
        className="fixed inset-0 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Panel */}
          <div
            className={`w-full ${sizeStyles[size]} transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-xl transition-all duration-300 ease-out animate-scaleIn`}
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'scale(1)' : 'scale(0.95)',
            }}
            onClick={handlePanelClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                {!preventClose && (
                  <button
                    type="button"
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 ease-in-out hover:scale-110"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5 transition-transform duration-200" />
                  </button>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
