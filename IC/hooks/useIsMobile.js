import { useIsMobileQuery } from '../lib/useMediaQuery';

/**
 * Hook to detect if viewport is mobile (< 768px)
 * Wrapper around centralized useMediaQuery for backward compatibility
 * Uses consistent Tailwind md breakpoint (768px)
 */
export function useIsMobile() {
  return useIsMobileQuery();
}
