import localforage from 'localforage';
import type { Document, Annotation } from '@/types';

// Configurazione per Safari iOS
// Safari in modalità privata ha limitazioni su IndexedDB
const storageConfig = {
  name: 'teatro-reader',
  driver: [
    localforage.INDEXEDDB, // Preferito
    localforage.WEBSQL, // Fallback per Safari vecchi
    localforage.LOCALSTORAGE, // Ultimo fallback (limitato)
  ],
};

// Store separati per performance
const documentsStore = localforage.createInstance({
  ...storageConfig,
  storeName: 'documents',
});

const annotationsStore = localforage.createInstance({
  ...storageConfig,
  storeName: 'annotations',
});

const audioStore = localforage.createInstance({
  ...storageConfig,
  storeName: 'audio',
});

// Verifica disponibilità storage (importante per Safari privato)
export async function checkStorageAvailability(): Promise<{
  available: boolean;
  driver: string;
  error?: string;
}> {
  try {
    await documentsStore.ready();
    const driver = documentsStore.driver();
    return { available: true, driver };
  } catch (error) {
    console.error('Storage non disponibile:', error);
    return {
      available: false,
      driver: 'none',
      error: error instanceof Error ? error.message : 'Storage non disponibile',
    };
  }
}

// ==================== DOCUMENTS ====================

export async function saveDocument(document: Document): Promise<void> {
  try {
    // Safari iOS può avere problemi con File objects direttamente
    // Convertiamo in un formato più compatibile
    const documentToSave: Document = {
      ...document,
      // Manteniamo il file object così com'è
      // localforage gestirà la serializzazione
    };
    await documentsStore.setItem(document.id, documentToSave);
  } catch (error) {
    console.error('Errore nel salvataggio documento:', error);
    throw new Error('Impossibile salvare il documento. Verifica lo spazio disponibile.');
  }
}

export async function getDocument(id: string): Promise<Document | null> {
  return await documentsStore.getItem<Document>(id);
}

export async function getAllDocuments(): Promise<Document[]> {
  const documents: Document[] = [];
  await documentsStore.iterate<Document, void>((value) => {
    documents.push(value);
  });
  return documents.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export async function deleteDocument(id: string): Promise<void> {
  // Prima elimina tutte le annotazioni e audio associati
  const annotations = await getAnnotationsByDocument(id);
  for (const annotation of annotations) {
    if (annotation.audioMemo) {
      await deleteAudioBlob(annotation.audioMemo.id);
    }
    await deleteAnnotation(annotation.id);
  }
  // Poi elimina il documento
  await documentsStore.removeItem(id);
}

// ==================== ANNOTATIONS ====================

export async function saveAnnotation(annotation: Annotation): Promise<void> {
  // Salva il blob audio separatamente se presente
  if (annotation.audioMemo?.blob) {
    await saveAudioBlob(annotation.audioMemo.id, annotation.audioMemo.blob);
  }

  // Salva l'annotazione senza il blob (solo riferimento)
  const annotationToSave: Annotation = {
    ...annotation,
    audioMemo: annotation.audioMemo
      ? {
          ...annotation.audioMemo,
          blob: null as unknown as Blob, // Non salvare il blob nell'annotazione
        }
      : undefined,
  };
  await annotationsStore.setItem(annotation.id, annotationToSave);
}

export async function getAnnotation(id: string): Promise<Annotation | null> {
  const annotation = await annotationsStore.getItem<Annotation>(id);
  if (!annotation) return null;

  // Recupera il blob audio se presente
  if (annotation.audioMemo) {
    const blob = await getAudioBlob(annotation.audioMemo.id);
    if (blob) {
      annotation.audioMemo.blob = blob;
    }
  }

  return annotation;
}

export async function getAnnotationsByDocument(documentId: string): Promise<Annotation[]> {
  const annotations: Annotation[] = [];
  await annotationsStore.iterate<Annotation, void>((value) => {
    if (value.documentId === documentId) {
      annotations.push(value);
    }
  });

  // Recupera i blob audio per ogni annotazione
  for (const annotation of annotations) {
    if (annotation.audioMemo) {
      const blob = await getAudioBlob(annotation.audioMemo.id);
      if (blob) {
        annotation.audioMemo.blob = blob;
      }
    }
  }

  return annotations.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getAllAnnotations(): Promise<Annotation[]> {
  const annotations: Annotation[] = [];
  await annotationsStore.iterate<Annotation, void>((value) => {
    annotations.push(value);
  });

  // Recupera i blob audio per ogni annotazione
  for (const annotation of annotations) {
    if (annotation.audioMemo) {
      const blob = await getAudioBlob(annotation.audioMemo.id);
      if (blob) {
        annotation.audioMemo.blob = blob;
      }
    }
  }

  return annotations.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function deleteAnnotation(id: string): Promise<void> {
  const annotation = await annotationsStore.getItem<Annotation>(id);
  if (annotation?.audioMemo) {
    await deleteAudioBlob(annotation.audioMemo.id);
  }
  await annotationsStore.removeItem(id);
}

export async function updateAnnotation(annotation: Annotation): Promise<void> {
  await saveAnnotation(annotation);
}

// ==================== AUDIO BLOBS ====================

export async function saveAudioBlob(id: string, blob: Blob): Promise<void> {
  try {
    // Safari iOS può richiedere una conversione esplicita
    // Verifichiamo che il blob sia valido
    if (!blob || blob.size === 0) {
      throw new Error('Blob audio non valido');
    }

    await audioStore.setItem(id, blob);
  } catch (error) {
    console.error('Errore nel salvataggio audio blob:', error);
    throw new Error('Impossibile salvare l\'audio. Verifica lo spazio disponibile.');
  }
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
  return await audioStore.getItem<Blob>(id);
}

export async function deleteAudioBlob(id: string): Promise<void> {
  await audioStore.removeItem(id);
}

// ==================== TAGS ====================

export async function getAllTags(): Promise<string[]> {
  const tagsSet = new Set<string>();
  await annotationsStore.iterate<Annotation, void>((value) => {
    value.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

// ==================== EXPORT/IMPORT ====================

export interface ExportData {
  version: string;
  exportedAt: Date;
  documents: Document[];
  annotations: Annotation[];
}

export async function exportAllData(): Promise<ExportData> {
  const documents = await getAllDocuments();
  const annotations = await getAllAnnotations();

  return {
    version: '1.0.0',
    exportedAt: new Date(),
    documents,
    annotations,
  };
}

export async function exportDocumentData(documentId: string): Promise<ExportData | null> {
  const document = await getDocument(documentId);
  if (!document) return null;

  const annotations = await getAnnotationsByDocument(documentId);

  return {
    version: '1.0.0',
    exportedAt: new Date(),
    documents: [document],
    annotations,
  };
}

// ==================== STORAGE INFO ====================

export async function getStorageUsage(): Promise<{
  documents: number;
  annotations: number;
  audioFiles: number;
}> {
  let documents = 0;
  let annotations = 0;
  let audioFiles = 0;

  await documentsStore.iterate(() => {
    documents++;
  });
  await annotationsStore.iterate(() => {
    annotations++;
  });
  await audioStore.iterate(() => {
    audioFiles++;
  });

  return { documents, annotations, audioFiles };
}

export async function clearAllData(): Promise<void> {
  await documentsStore.clear();
  await annotationsStore.clear();
  await audioStore.clear();
}
