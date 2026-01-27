import { useState, useEffect } from 'react';

/**
 * Hook per ritardare l'aggiornamento di un valore.
 * Utile per evitare aggiornamenti troppo frequenti (es. ricerca).
 *
 * @param value Il valore da debounce
 * @param delay Ritardo in millisecondi (default 300ms)
 * @returns Il valore debounced
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
