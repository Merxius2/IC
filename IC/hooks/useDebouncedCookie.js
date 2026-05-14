import { useRef, useCallback } from 'react';
import { saveToCookie } from '../lib/cookieStorage';

/**
 * Hook to handle debounced cookie saves
 * Prevents excessive cookie writes by debouncing updates
 * @param {string} key - Cookie key name
 * @param {object} data - Data to save
 * @param {number} days - Cookie expiration days (default: 365)
 * @param {number} delay - Debounce delay in milliseconds (default: 500)
 * @returns {function} Function to call when data changes
 */
export function useDebouncedCookie(key, data, days = 365, delay = 500) {
  const saveCookieTimeout = useRef(null);

  const debouncedSave = useCallback(() => {
    if (saveCookieTimeout.current) clearTimeout(saveCookieTimeout.current);
    saveCookieTimeout.current = setTimeout(() => {
      saveToCookie(key, data, days);
    }, delay);
  }, [key, data, days, delay]);

  return debouncedSave;
}
