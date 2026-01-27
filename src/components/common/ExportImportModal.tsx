import { useState, useCallback, useRef } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { Button } from './Button';
import { useDocumentStore } from '@/store';
import {
  downloadExport,
  estimateExportSize,
  formatFileSize,
} from '@/services/exportService';
import {
  validateImportFile,
  importFromJSON,
  type ValidationResult,
  type ImportResult,
} from '@/services/importService';

type TabType = 'export' | 'import';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

export function ExportImportModal({ isOpen, onClose, onImportComplete }: ExportImportModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('export');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Esporta / Importa" size="lg">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('export')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'export'
              ? 'text-teatro-600 border-b-2 border-teatro-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Esporta
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'import'
              ? 'text-teatro-600 border-b-2 border-teatro-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowUpTrayIcon className="w-4 h-4" />
          Importa
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'export' && <ExportTab onClose={onClose} />}
      {activeTab === 'import' && <ImportTab onClose={onClose} onImportComplete={onImportComplete} />}
    </Modal>
  );
}

// ==================== EXPORT TAB ====================

function ExportTab({ onClose }: { onClose: () => void }) {
  const [exportScope, setExportScope] = useState<'all' | 'current'>('all');
  const [includeAudio, setIncludeAudio] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const { currentDocument } = useDocumentStore();

  const handleEstimateSize = useCallback(async () => {
    setIsEstimating(true);
    try {
      const size = await estimateExportSize({
        includeAudio,
        documentId: exportScope === 'current' ? currentDocument?.id : undefined,
      });
      setEstimatedSize(formatFileSize(size));
    } catch {
      setEstimatedSize(null);
    } finally {
      setIsEstimating(false);
    }
  }, [includeAudio, exportScope, currentDocument?.id]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport({
        includeAudio,
        documentId: exportScope === 'current' ? currentDocument?.id : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Errore durante export:', error);
      alert('Errore durante l\'esportazione. Riprova.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scope selection */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Cosa esportare
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="exportScope"
              value="all"
              checked={exportScope === 'all'}
              onChange={() => setExportScope('all')}
              className="text-teatro-600 focus:ring-teatro-500"
            />
            <span className="text-sm text-gray-700">Tutti i documenti e annotazioni</span>
          </label>
          <label className={`flex items-center gap-2 ${currentDocument ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
            <input
              type="radio"
              name="exportScope"
              value="current"
              checked={exportScope === 'current'}
              onChange={() => setExportScope('current')}
              disabled={!currentDocument}
              className="text-teatro-600 focus:ring-teatro-500"
            />
            <span className="text-sm text-gray-700">
              Solo documento corrente
              {currentDocument && (
                <span className="text-gray-500 ml-1">({currentDocument.name})</span>
              )}
            </span>
          </label>
        </div>
      </div>

      {/* Include audio option */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeAudio}
            onChange={(e) => setIncludeAudio(e.target.checked)}
            className="mt-0.5 text-teatro-600 focus:ring-teatro-500 rounded"
          />
          <div>
            <span className="text-sm text-gray-700">Includi memo audio</span>
            <p className="text-xs text-gray-500 mt-0.5">
              {includeAudio
                ? 'Il file sarà più grande ma includerà tutte le registrazioni'
                : 'Verranno esportati solo i metadati, senza le registrazioni audio'}
            </p>
          </div>
        </label>
      </div>

      {/* Estimate size button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEstimateSize}
          disabled={isEstimating}
        >
          {isEstimating ? 'Calcolo...' : 'Calcola dimensione'}
        </Button>
        {estimatedSize && (
          <span className="text-sm text-gray-600">
            Dimensione stimata: <strong>{estimatedSize}</strong>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onClose}>
          Annulla
        </Button>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={isExporting}
          leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
        >
          {isExporting ? 'Esportazione...' : 'Esporta'}
        </Button>
      </div>
    </div>
  );
}

// ==================== IMPORT TAB ====================

function ImportTab({
  onClose,
  onImportComplete,
}: {
  onClose: () => void;
  onImportComplete?: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setImportResult(null);
    setIsValidating(true);

    try {
      const result = await validateImportFile(file);
      setValidation(result);
    } catch {
      setValidation({ valid: false, errors: ['Errore durante la validazione del file'] });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const result = await importFromJSON(selectedFile);
      setImportResult(result);

      if (result.success || result.documentsImported > 0 || result.annotationsImported > 0) {
        onImportComplete?.();
      }
    } catch (error) {
      setImportResult({
        success: false,
        documentsImported: 0,
        annotationsImported: 0,
        documentsSkipped: 0,
        annotationsSkipped: 0,
        errors: [`Errore durante l'importazione: ${error}`],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidation(null);
    setImportResult(null);
  };

  // Se import completato con successo, mostra risultato
  if (importResult && (importResult.documentsImported > 0 || importResult.annotationsImported > 0)) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Importazione completata</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Documenti importati: <strong>{importResult.documentsImported}</strong></p>
            <p>Annotazioni importate: <strong>{importResult.annotationsImported}</strong></p>
            {importResult.documentsSkipped > 0 && (
              <p className="text-gray-500">
                Documenti già presenti (saltati): {importResult.documentsSkipped}
              </p>
            )}
            {importResult.annotationsSkipped > 0 && (
              <p className="text-gray-500">
                Annotazioni già presenti (saltate): {importResult.annotationsSkipped}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-4 border-t border-gray-200">
          <Button variant="primary" onClick={onClose}>
            Chiudi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File drop zone */}
      {!selectedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-teatro-500 bg-teatro-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Trascina qui il file JSON o clicca per selezionarlo
          </p>
          <p className="text-xs text-gray-500">
            Solo file .json esportati da Suggeritore
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      )}

      {/* Selected file info */}
      {selectedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DocumentIcon className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Validation status */}
      {isValidating && (
        <div className="text-center text-sm text-gray-600">
          Validazione in corso...
        </div>
      )}

      {validation && !isValidating && (
        <div className={`rounded-lg p-4 ${validation.valid ? 'bg-green-50' : 'bg-red-50'}`}>
          {validation.valid ? (
            <>
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="font-medium">File valido</span>
              </div>
              {validation.stats && (
                <div className="text-sm text-green-600 space-y-1">
                  <p>Documenti da importare: <strong>{validation.stats.documents}</strong></p>
                  <p>Annotazioni da importare: <strong>{validation.stats.annotations}</strong></p>
                  {validation.stats.annotationsWithAudio > 0 && (
                    <p>Di cui con memo audio: <strong>{validation.stats.annotationsWithAudio}</strong></p>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-medium">File non valido</span>
              </div>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Import errors */}
      {importResult && importResult.errors.length > 0 && (
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="font-medium">Errori durante l'importazione</span>
          </div>
          <ul className="text-sm text-red-600 list-disc list-inside">
            {importResult.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={onClose}>
          Annulla
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={!selectedFile || !validation?.valid || isImporting}
          leftIcon={<ArrowUpTrayIcon className="w-4 h-4" />}
        >
          {isImporting ? 'Importazione...' : 'Importa'}
        </Button>
      </div>
    </div>
  );
}
