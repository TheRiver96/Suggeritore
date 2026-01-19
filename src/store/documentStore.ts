import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Document, DocumentState } from '@/types';
import * as storage from '@/services/storage';

interface DocumentActions {
  loadDocuments: () => Promise<void>;
  addDocument: (file: File) => Promise<Document>;
  setCurrentDocument: (document: Document | null) => void;
  removeDocument: (id: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  setZoom: (zoom: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setError: (error: string | null) => void;
}

type DocumentStore = DocumentState & DocumentActions;

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  isLoading: false,
  error: null,
};

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  ...initialState,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const documents = await storage.getAllDocuments();
      set({ documents, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Errore nel caricamento documenti',
        isLoading: false,
      });
    }
  },

  addDocument: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const type = file.name.toLowerCase().endsWith('.epub') ? 'epub' : 'pdf';

      const document: Document = {
        id: uuidv4(),
        name: file.name,
        type,
        file: file,
        uploadedAt: new Date(),
        metadata: {
          title: file.name.replace(/\.(pdf|epub)$/i, ''),
        },
      };

      await storage.saveDocument(document);
      set((state) => ({
        documents: [document, ...state.documents],
        isLoading: false,
      }));

      return document;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Errore nel salvataggio documento',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentDocument: (document) => {
    set({
      currentDocument: document,
      currentPage: 1,
      totalPages: 0,
    });
  },

  removeDocument: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await storage.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Errore nella rimozione documento',
        isLoading: false,
      });
    }
  },

  setCurrentPage: (page) => {
    const { totalPages } = get();
    if (page >= 1 && page <= totalPages) {
      set({ currentPage: page });
    }
  },

  setTotalPages: (pages) => {
    set({ totalPages: pages });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.5, Math.min(3, zoom)) });
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    console.log('[documentStore] nextPage called - current:', currentPage, 'total:', totalPages);
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
      console.log('[documentStore] nextPage - updated to:', currentPage + 1);
    } else {
      console.log('[documentStore] nextPage - blocked (already at last page)');
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    console.log('[documentStore] prevPage called - current:', currentPage);
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
      console.log('[documentStore] prevPage - updated to:', currentPage - 1);
    } else {
      console.log('[documentStore] prevPage - blocked (already at first page)');
    }
  },

  setError: (error) => {
    set({ error });
  },
}));
