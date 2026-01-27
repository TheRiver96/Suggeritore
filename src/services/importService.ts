import * as storage from './storage';
import type { ExportData, ExportedAnnotation } from './exportService';
import type { Annotation } from '@/types';

export interface ImportResult {
  success: boolean;
  documentsImported: number;
  annotationsImported: number;
  documentsSkipped: number;
  annotationsSkipped: number;
  errors: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: ExportData;
  stats?: {
    documents: number;
    annotations: number;
    annotationsWithAudio: number;
  };
}

/**
 * Converte base64 string in Blob
 */
function base64ToBlob(base64: string): Blob {
  const [header, data] = base64.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'audio/webm';
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mimeType });
}

/**
 * Valida il file JSON prima dell'import
 */
export async function validateImportFile(file: File): Promise<ValidationResult> {
  const errors: string[] = [];

  // Verifica tipo file
  if (!file.name.endsWith('.json')) {
    return { valid: false, errors: ['Il file deve essere in formato JSON'] };
  }

  // Leggi contenuto
  let content: string;
  try {
    content = await file.text();
  } catch {
    return { valid: false, errors: ['Impossibile leggere il file'] };
  }

  // Parse JSON
  let data: ExportData;
  try {
    data = JSON.parse(content);
  } catch {
    return { valid: false, errors: ['Il file non contiene JSON valido'] };
  }

  // Verifica struttura base
  if (!data.version) {
    errors.push('Manca il campo "version"');
  }

  if (!data.exportedAt) {
    errors.push('Manca il campo "exportedAt"');
  }

  if (!Array.isArray(data.documents)) {
    errors.push('Il campo "documents" deve essere un array');
  }

  if (!Array.isArray(data.annotations)) {
    errors.push('Il campo "annotations" deve essere un array');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Verifica versione compatibile
  const version = data.version.split('.').map(Number);
  if (version[0] > 1) {
    errors.push(`Versione ${data.version} non compatibile. Questa app supporta versioni fino a 1.x.x`);
    return { valid: false, errors };
  }

  // Calcola statistiche
  const annotationsWithAudio = data.annotations.filter(
    (a) => a.audioMemo?.data
  ).length;

  return {
    valid: true,
    errors: [],
    data,
    stats: {
      documents: data.documents.length,
      annotations: data.annotations.length,
      annotationsWithAudio,
    },
  };
}

/**
 * Esegue l'import dei dati
 */
export async function importFromJSON(file: File): Promise<ImportResult> {
  const validation = await validateImportFile(file);

  if (!validation.valid || !validation.data) {
    return {
      success: false,
      documentsImported: 0,
      annotationsImported: 0,
      documentsSkipped: 0,
      annotationsSkipped: 0,
      errors: validation.errors,
    };
  }

  const { data } = validation;
  const errors: string[] = [];
  let documentsImported = 0;
  let annotationsImported = 0;
  let documentsSkipped = 0;
  let annotationsSkipped = 0;

  // Import documenti
  for (const doc of data.documents) {
    try {
      // Verifica se documento esiste già
      const existing = await storage.getDocument(doc.id);
      if (existing) {
        documentsSkipped++;
        continue;
      }

      // Converti date da string a Date
      const documentToSave = {
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
      };

      await storage.saveDocument(documentToSave);
      documentsImported++;
    } catch (error) {
      errors.push(`Errore importando documento ${doc.name}: ${error}`);
    }
  }

  // Import annotazioni
  for (const exportedAnnotation of data.annotations) {
    try {
      // Verifica se annotazione esiste già
      const existing = await storage.getAnnotation(exportedAnnotation.id);
      if (existing) {
        annotationsSkipped++;
        continue;
      }

      // Converti annotazione esportata in annotazione completa
      const annotation = convertExportedAnnotation(exportedAnnotation);

      await storage.saveAnnotation(annotation);
      annotationsImported++;
    } catch (error) {
      errors.push(`Errore importando annotazione: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    documentsImported,
    annotationsImported,
    documentsSkipped,
    annotationsSkipped,
    errors,
  };
}

/**
 * Converte annotazione esportata in annotazione completa
 */
function convertExportedAnnotation(exported: ExportedAnnotation): Annotation {
  const annotation: Annotation = {
    id: exported.id,
    documentId: exported.documentId,
    location: exported.location,
    selectedText: exported.selectedText,
    textContext: exported.textContext,
    tags: exported.tags || [],
    color: exported.color,
    notes: exported.notes,
    createdAt: new Date(exported.createdAt),
    updatedAt: new Date(exported.updatedAt),
  };

  // Converti audio se presente
  if (exported.audioMemo) {
    const audioMemo = {
      id: exported.audioMemo.id,
      duration: exported.audioMemo.duration,
      mimeType: exported.audioMemo.mimeType,
      blob: exported.audioMemo.data
        ? base64ToBlob(exported.audioMemo.data)
        : new Blob([], { type: exported.audioMemo.mimeType }),
    };
    annotation.audioMemo = audioMemo;
  }

  return annotation;
}

/**
 * Legge un file e restituisce le statistiche di preview
 */
export async function previewImportFile(file: File): Promise<ValidationResult> {
  return validateImportFile(file);
}
