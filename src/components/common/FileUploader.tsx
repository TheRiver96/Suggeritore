import { useCallback, useState } from 'react';
import { DocumentPlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUploader({
  onFileSelect,
  accept = 'application/pdf,application/epub+zip,.pdf,.epub',
  maxSize = 100 * 1024 * 1024, // 100MB default
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // Verifica estensione
      const extension = file.name.toLowerCase().split('.').pop();
      const validExtensions = ['pdf', 'epub'];

      if (!extension || !validExtensions.includes(extension)) {
        setError(`Formato non supportato. Usa: ${validExtensions.join(', ')}`);
        return false;
      }

      // Verifica dimensione
      if (file.size > maxSize) {
        const maxMB = Math.round(maxSize / (1024 * 1024));
        setError(`File troppo grande. Massimo ${maxMB}MB`);
        return false;
      }

      // Verifica che il file abbia contenuto
      if (file.size === 0) {
        setError('Il file è vuoto');
        return false;
      }

      return true;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelect(file);
      }
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];

      if (file) {
        try {
          handleFile(file);
        } catch (error) {
          console.error('Errore nella gestione del file:', error);
          setError('Errore nel caricamento del file. Riprova.');
        }
      }

      // Reset input per permettere di selezionare lo stesso file
      e.target.value = '';
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          flex flex-col items-center justify-center w-full h-48
          border-2 border-dashed rounded-xl cursor-pointer
          transition-colors duration-200 ease-in-out
          ${
            isDragging
              ? 'border-teatro-500 bg-teatro-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
          {isDragging ? (
            <ArrowUpTrayIcon className="w-12 h-12 mb-3 text-teatro-500" />
          ) : (
            <DocumentPlusIcon className="w-12 h-12 mb-3 text-gray-400" />
          )}
          <p className="mb-2 text-sm text-gray-700">
            <span className="font-semibold">Clicca per caricare</span> o trascina qui
          </p>
          <p className="text-xs text-gray-500">PDF o EPUB (max 100MB)</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleInputChange}
        />
      </label>

      {error && (
        <p className="mt-2 text-sm text-red-600 text-center animate-fadeIn">{error}</p>
      )}
    </div>
  );
}
