import { useState, useEffect } from 'react';
import { loadFromCookie } from '../lib/cookieStorage';
import { useDebouncedCookie } from './useDebouncedCookie';

/**
 * Centralized Cookie Storage Hook
 * 
 * Eliminates repetitive cookie loading/saving boilerplate across pages.
 * Combines automatic loading on mount, debounced saving on changes, and isLoading tracking.
 * 
 * @param {string} cookieKey - Cookie storage key in AUDIT_{FEATURE}_{PURPOSE} format
 *                             Examples: 'AUDIT_DASHBOARD_DATA', 'AUDIT_TAX_DATA'
 * @param {object} initialData - Default data structure if no cookie exists
 *                               Should match your expected data shape
 * @param {number} [debounceDelay=1000] - Debounce delay for saves in milliseconds
 *                                         Prevents excessive cookie writes during rapid changes
 * 
 * @returns {object} Hook state and control object
 * @returns {object} .data - Current data object (merged with cookie on mount)
 * @returns {boolean} .isLoading - Whether initial cookie load is in progress
 * @returns {function} .updateData - Update data (single field or entire object)
 * 
 * @example
 * // Basic usage - dashboard income/expenses tracking
 * const { data, isLoading, updateData } = useCookieStorage('AUDIT_DASHBOARD_DATA', {
 *   incomes: [],
 *   expenses: { rent: '', utilities: '' },
 *   savings: '',
 * });
 * 
 * // Update single field
 * updateData('incomes', [...data.incomes, { description: 'Salary', amount: 5000 }]);
 * 
 * // Update expenses object
 * updateData('expenses', { ...data.expenses, rent: 1500 });
 * 
 * // Replace entire data object
 * updateData(null, completeNewDataObject);
 * 
 * // In render
 * if (isLoading) return <LoadingSpinner />;
 * return <YourComponent data={data} onUpdate={updateData} />;
 * 
 * @example
 * // Tax calculator - handles multiple fields
 * const { data, isLoading, updateData } = useCookieStorage('AUDIT_TAX_DATA', {
 *   incomeInput: '',
 *   calculationMode: 'gross-to-net',
 *   isExpat: false,
 * });
 * 
 * const handleIncomeChange = (e) => {
 *   updateData('incomeInput', e.target.value); // Auto-saves after 1s of inactivity
 * };
 * 
 * @example
 * // Retirement planner - with custom debounce
 * const { data, isLoading, updateData } = useCookieStorage(
 *   'AUDIT_RETIREMENT_DATA',
 *   {
 *     calculationType: 'forward',
 *     currentAge: '30',
 *     retirementAge: '65',
 *     monthlyInvestment: '1000',
 *     annualReturn: '7',
 *   },
 *   2000 // 2 second debounce for complex calculations
 * );
 * 
 * @behavior
 * - Automatically loads from cookie on component mount
 * - Combines loaded data with initialData (loaded data takes precedence)
 * - Automatically saves to cookie whenever data changes (debounced)
 * - Debounce prevents excessive localStorage writes during rapid changes
 * - isLoading prevents UI race conditions during SSR hydration
 * - Survives component unmount/remount (cookie persists across navigation)
 * 
 * @note
 * - Do NOT use this hook for real-time collaborative data (use WebSocket instead)
 * - Cookie expires after 30 days (via useDebouncedCookie)
 * - Large data objects (>10KB) may hit cookie size limits (browser-dependent)
 * - For SSR: Use isLoading to avoid hydration mismatches
 * 
 * @migration
 * Replaces this ~40 line boilerplate pattern in every page:
 * ```
 * const [state, setState] = useState(initialValue);
 * const [isLoading, setIsLoading] = useState(true);
 * const debouncedSave = useDebouncedCookie(key, { state });
 * useEffect(() => {
 *   const saved = loadFromCookie(key);
 *   if (saved) setState(saved.state);
 *   setIsLoading(false);
 * }, []);
 * useEffect(() => {
 *   if (!isLoading) debouncedSave();
 * }, [state, isLoading]);
 * ```
 * 
 * With one line:
 * ```
 * const { data, isLoading, updateData } = useCookieStorage(key, { state: initialValue });
 * ```
 */
export function useCookieStorage(cookieKey, initialData = {}, debounceDelay = 1000) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(true);

  // Load from cookie on mount
  useEffect(() => {
    const savedData = loadFromCookie(cookieKey);
    if (savedData) {
      setData((prevData) => ({ ...prevData, ...savedData }));
    }
    setIsLoading(false);
  }, [cookieKey]);

  // Set up debounced save
  const debouncedSave = useDebouncedCookie(cookieKey, data, 30, debounceDelay);

  // Save whenever data changes
  useEffect(() => {
    if (!isLoading) {
      debouncedSave();
    }
  }, [data, isLoading, debouncedSave]);

  /**
   * Update a field in the data or replace entire data
   * @param {string|null} field - Field to update, or null to replace entire data
   * @param {any} value - New value for field or entire data object
   */
  const updateData = (field, value) => {
    if (field === null) {
      // Replace entire data
      setData(value);
    } else {
      // Update single field
      setData((prevData) => ({
        ...prevData,
        [field]: value,
      }));
    }
  };

  return {
    data,
    isLoading,
    updateData,
  };
}
