export interface AnnotationLocation {
  page?: number;           // Per PDF
  cfi?: string;            // Per EPUB (Canonical Fragment Identifier)
  startOffset: number;
  endOffset: number;
}

export interface AudioMemo {
  id: string;
  blob: Blob;
  duration: number;
  mimeType: string;
}

export interface Annotation {
  id: string;
  documentId: string;

  // Posizione nel documento
  location: AnnotationLocation;

  // Contenuto
  selectedText: string;
  textContext: string;       // Testo circostante per contestualizzare

  // Audio memo
  audioMemo?: AudioMemo;

  // Metadati
  tags: string[];            // es: ["atto1", "monologo", "importante"]
  color: string;             // Per evidenziazione visuale
  notes?: string;            // Note testuali opzionali

  // Timestamp
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationState {
  annotations: Annotation[];
  selectedAnnotation: Annotation | null;
  highlightedAnnotationId: string | null; // ID dell'annotazione da evidenziare temporaneamente
  isCreating: boolean;
  filterTags: string[];
  searchQuery: string;
}

export const DEFAULT_ANNOTATION_COLORS = [
  '#cb3158', // Teatro red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];
