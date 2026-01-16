import { useState, useEffect } from 'react';

/**
 * Hook per rilevare media queries e breakpoints responsive
 *
 * Breakpoints:
 * - Mobile: < 640px
 * - Tablet: 640px - 1024px
 * - Desktop: > 1024px
 *
 * @param query - Media query CSS (es: '(min-width: 640px)')
 * @returns boolean - true se la media query corrisponde
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // SSR safety: ritorna false di default
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // SSR safety
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    // Handler per cambiamenti
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Imposta valore iniziale
    setMatches(mediaQuery.matches);

    // Aggiungi listener (supporto browser moderni e legacy)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback per browser più vecchi
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook preconfigurati per breakpoints comuni
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Touch device detection (non basato solo su width)
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    // Aliases utili
    isSmallScreen: isMobile,
    isMediumScreen: isTablet,
    isLargeScreen: isDesktop,
  };
}
