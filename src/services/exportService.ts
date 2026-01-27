import * as storage from './storage';
import type { Annotation, Document } from '@/types';

export interface ExportOptions {
  includeAudio: boolean;
  documentId?: string; // null/undefined = tutti i documenti
}

export interface ExportedAnnotation extends Omit<Annotation, 'audioMemo'> {
  audioMemo?: {
    id: string;
    duration: number;
    mimeType: string;
    data?: string; // base64 se includeAudio=true
  };
}

export interface ExportData {
  version: string;
  exportedAt: string;
  documents: Document[];
  annotations: ExportedAnnotation[];
}

/**
 * Converte un Blob in base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Prepara i dati per l'export
 */
export async function prepareExportData(options: ExportOptions): Promise<ExportData> {
  const { includeAudio, documentId } = options;

  // Recupera documenti e annotazioni
  let documents: Document[];
  let annotations: Annotation[];

  if (documentId) {
    const doc = await storage.getDocument(documentId);
    documents = doc ? [doc] : [];
    annotations = await storage.getAnnotationsByDocument(documentId);
  } else {
    documents = await storage.getAllDocuments();
    annotations = await storage.getAllAnnotations();
  }

  // Converti annotazioni, gestendo audio
  const exportedAnnotations: ExportedAnnotation[] = await Promise.all(
    annotations.map(async (annotation) => {
      const { audioMemo, ...rest } = annotation;

      if (!audioMemo) {
        return rest as ExportedAnnotation;
      }

      // Se includeAudio, converti blob in base64
      if (includeAudio && audioMemo.blob) {
        const data = await blobToBase64(audioMemo.blob);
        return {
          ...rest,
          audioMemo: {
            id: audioMemo.id,
            duration: audioMemo.duration,
            mimeType: audioMemo.mimeType,
            data,
          },
        };
      }

      // Altrimenti includi solo metadati (senza blob)
      return {
        ...rest,
        audioMemo: {
          id: audioMemo.id,
          duration: audioMemo.duration,
          mimeType: audioMemo.mimeType,
        },
      };
    })
  );

  return {
    version: '1.3.0',
    exportedAt: new Date().toISOString(),
    documents,
    annotations: exportedAnnotations,
  };
}

/**
 * Genera il blob JSON per il download
 */
export async function exportToJSON(options: ExportOptions): Promise<Blob> {
  const data = await prepareExportData(options);
  const json = JSON.stringify(data, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Genera nome file per export
 */
function generateExportFilename(documentId?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  if (documentId) {
    return `suggeritore-export-documento-${timestamp}.json`;
  }
  return `suggeritore-export-completo-${timestamp}.json`;
}

/**
 * Esegue export e download del file
 */
export async function downloadExport(options: ExportOptions): Promise<void> {
  const blob = await exportToJSON(options);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = generateExportFilename(options.documentId);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Rilascia URL dopo un breve delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Calcola dimensione stimata dell'export (in bytes)
 */
export async function estimateExportSize(options: ExportOptions): Promise<number> {
  const data = await prepareExportData(options);
  const json = JSON.stringify(data);
  return new Blob([json]).size;
}

/**
 * Formatta dimensione file in stringa leggibile
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
