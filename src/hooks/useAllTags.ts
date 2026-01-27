import { useMemo } from 'react';
import { useAnnotationStore } from '@/store';

export interface TagWithCount {
  tag: string;
  count: number;
}

/**
 * Hook per ottenere tutti i tag usati nelle annotazioni del documento corrente.
 * I tag sono ordinati per frequenza d'uso (piu usati prima).
 *
 * @returns Array di tag con conteggio, ordinati per frequenza decrescente
 */
export function useAllTags(): TagWithCount[] {
  const annotations = useAnnotationStore((state) => state.annotations);

  return useMemo(() => {
    const tagCounts = new Map<string, number>();

    annotations.forEach((annotation) => {
      annotation.tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Ordina per frequenza decrescente
  }, [annotations]);
}

/**
 * Hook per ottenere solo i nomi dei tag (senza conteggio).
 * Utile per l'autocomplete.
 *
 * @returns Array di stringhe tag, ordinati per frequenza
 */
export function useTagNames(): string[] {
  const tagsWithCount = useAllTags();
  return useMemo(() => tagsWithCount.map((t) => t.tag), [tagsWithCount]);
}
