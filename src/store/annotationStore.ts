import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Annotation, AnnotationState, AnnotationLocation, AudioMemo } from '@/types';
import * as storage from '@/services/storage';
import { DEFAULT_ANNOTATION_COLORS } from '@/types/annotation';

interface AnnotationActions {
  loadAnnotations: (documentId: string) => Promise<void>;
  createAnnotation: (params: {
    documentId: string;
    location: AnnotationLocation;
    selectedText: string;
    textContext: string;
    audioMemo?: AudioMemo;
    tags?: string[];
    color?: string;
    notes?: string;
  }) => Promise<Annotation>;
  updateAnnotation: (annotation: Annotation) => Promise<void>;
  deleteAnnotation: (id: string) => Promise<void>;
  setSelectedAnnotation: (annotation: Annotation | null) => void;
  setHighlightedAnnotationId: (id: string | null) => void;
  highlightAnnotationTemporarily: (id: string, durationMs?: number) => void;
  setIsCreating: (isCreating: boolean) => void;
  setFilterTags: (tags: string[]) => void;
  setSearchQuery: (query: string) => void;
  getAllTags: () => Promise<string[]>;
  clearAnnotations: () => void;
}

type AnnotationStore = AnnotationState & AnnotationActions;

const initialState: AnnotationState = {
  annotations: [],
  selectedAnnotation: null,
  highlightedAnnotationId: null,
  isCreating: false,
  filterTags: [],
  searchQuery: '',
};

export const useAnnotationStore = create<AnnotationStore>((set) => ({
  ...initialState,

  loadAnnotations: async (documentId: string) => {
    try {
      const annotations = await storage.getAnnotationsByDocument(documentId);
      set({ annotations });
    } catch (error) {
      console.error('Errore nel caricamento annotazioni:', error);
    }
  },

  createAnnotation: async (params) => {
    const annotation: Annotation = {
      id: uuidv4(),
      documentId: params.documentId,
      location: params.location,
      selectedText: params.selectedText,
      textContext: params.textContext,
      audioMemo: params.audioMemo,
      tags: params.tags ?? [],
      color: params.color ?? DEFAULT_ANNOTATION_COLORS[0],
      notes: params.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.saveAnnotation(annotation);
    set((state) => ({
      annotations: [...state.annotations, annotation],
      isCreating: false,
    }));

    return annotation;
  },

  updateAnnotation: async (annotation) => {
    const updatedAnnotation = {
      ...annotation,
      updatedAt: new Date(),
    };

    await storage.updateAnnotation(updatedAnnotation);
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === annotation.id ? updatedAnnotation : a
      ),
      selectedAnnotation:
        state.selectedAnnotation?.id === annotation.id ? updatedAnnotation : state.selectedAnnotation,
    }));
  },

  deleteAnnotation: async (id) => {
    await storage.deleteAnnotation(id);
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
      selectedAnnotation: state.selectedAnnotation?.id === id ? null : state.selectedAnnotation,
    }));
  },

  setSelectedAnnotation: (annotation) => {
    set({ selectedAnnotation: annotation });
  },

  setHighlightedAnnotationId: (id) => {
    set({ highlightedAnnotationId: id });
  },

  highlightAnnotationTemporarily: (id, durationMs = 2000) => {
    set({ highlightedAnnotationId: id });
    setTimeout(() => {
      set((state) =>
        state.highlightedAnnotationId === id
          ? { highlightedAnnotationId: null }
          : state
      );
    }, durationMs);
  },

  setIsCreating: (isCreating) => {
    set({ isCreating });
  },

  setFilterTags: (tags) => {
    set({ filterTags: tags });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getAllTags: async () => {
    return await storage.getAllTags();
  },

  clearAnnotations: () => {
    set({ annotations: [], selectedAnnotation: null });
  },
}));

// Selettori helper per filtrare annotazioni
export const selectFilteredAnnotations = (state: AnnotationStore): Annotation[] => {
  let filtered = state.annotations;

  // Filtra per tag
  if (state.filterTags.length > 0) {
    filtered = filtered.filter((a) =>
      state.filterTags.some((tag) => a.tags.includes(tag))
    );
  }

  // Filtra per ricerca testuale
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.selectedText.toLowerCase().includes(query) ||
        a.notes?.toLowerCase().includes(query) ||
        a.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  return filtered;
};

export const selectAnnotationsByPage = (
  state: AnnotationStore,
  page: number
): Annotation[] => {
  return state.annotations.filter((a) => a.location.page === page);
};
