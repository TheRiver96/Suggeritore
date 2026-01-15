export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'epub';
  file: Blob;
  uploadedAt: Date;
  metadata?: {
    author?: string;
    title?: string;
    totalPages?: number;
  };
}

export interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  isLoading: boolean;
  error: string | null;
}
