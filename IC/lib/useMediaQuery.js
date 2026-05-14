import { useState, useEffect } from 'react';

/**
 * Centralized media query hook
 * Consistent breakpoint usage across the app
 * Uses Tailwind's md breakpoint (768px) for mobile detection
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Only run on client
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQueryList.matches);

    // Create event listener
    const handleChange = (e) => {
      setMatches(e.matches);
    };

    // Add listener
    mediaQueryList.addEventListener('change', handleChange);
    
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [query]);

  // Don't render until client side to avoid hydration mismatch
  if (!isClient) return false;
  return matches;
}

/**
 * Hook to detect if viewport is mobile (< 768px - Tailwind md breakpoint)
 * Centralized mobile detection used throughout app
 */
export function useIsMobileQuery() {
  return useMediaQuery('(max-width: 767px)');
}
