/**
 * Application Constants
 * Centralized repository for magic numbers, thresholds, and configuration values
 * Makes it easy to update values across the entire app (e.g., for new tax years)
 */

// ============================================================================
// TAX CALCULATION CONSTANTS
// ============================================================================

/**
 * Expat income cap for 30% tax exemption (Balkenende-norm, 2026)
 * Employees working in the Netherlands who qualify for the 30% tax exemption
 * can only use it on income up to this threshold
 */
export const EXPAT_INCOME_CAP_2026 = 244000;

/**
 * Expat tax exemption rate
 * Qualifying expats can exclude this percentage of income from taxation
 */
export const EXPAT_EXEMPTION_RATE = 0.30; // 30%

// ============================================================================
// INVESTMENT & RETIREMENT CONSTANTS
// ============================================================================

/**
 * Default annual investment return rate (%)
 * Used as placeholder for retirement projections
 * Historical average stock market return is ~7% annually
 */
export const DEFAULT_ANNUAL_INVESTMENT_RETURN = 7;

/**
 * Minimum age for retirement calculations
 */
export const MIN_RETIREMENT_AGE = 18;

/**
 * Maximum age for retirement projections
 */
export const MAX_RETIREMENT_AGE = 100;

/**
 * Default current age for retirement calculator
 */
export const DEFAULT_CURRENT_AGE = 30;

/**
 * Default retirement age
 */
export const DEFAULT_RETIREMENT_AGE = 65;

/**
 * Default monthly investment amount (€)
 */
export const DEFAULT_MONTHLY_INVESTMENT = 1000;

/**
 * Default goal balance for backward retirement projection (€)
 */
export const DEFAULT_RETIREMENT_GOAL = 500000;

// ============================================================================
// LOAN/DEBT CALCULATION CONSTANTS
// ============================================================================

/**
 * Default monthly rate calculation divisor
 * Annual rate / 100 / 12 to convert to monthly decimal
 */
export const MONTHS_PER_YEAR = 12;

/**
 * Precision for loan calculations
 */
export const LOAN_CALCULATION_PRECISION = 2; // decimal places

// ============================================================================
// UI CONSTANTS
// ============================================================================

/**
 * Mobile/tablet breakpoint (pixels)
 * Tailwind 'md' breakpoint
 */
export const BREAKPOINT_MD = 768;

/**
 * Minimum viewport width for desktop layout (pixels)
 * Tailwind 'lg' breakpoint
 */
export const BREAKPOINT_LG = 1024;

/**
 * Cookie expiration time in days
 * Default: 1 year
 */
export const COOKIE_EXPIRATION_DAYS = 365;

/**
 * Debounce delay for save operations (milliseconds)
 * Delays cookie saves to avoid hammering storage during rapid changes
 */
export const DEBOUNCE_DELAY_MS = 1000;

/**
 * Input debounce delay for calculations (milliseconds)
 */
export const CALCULATION_DEBOUNCE_MS = 500;

// ============================================================================
// CURRENCY CONSTANTS
// ============================================================================

/**
 * Default currency for display
 */
export const DEFAULT_CURRENCY = 'EUR';

/**
 * Currency symbols map
 */
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

// ============================================================================
// LANGUAGE CONSTANTS
// ============================================================================

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  nl: 'Nederlands',
  ru: 'Русский',
  tr: 'Türkçe',
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE = 'en';

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

/**
 * Maximum number of amortization schedule entries to display in charts
 * Reduces chart complexity for very long loan terms
 */
export const MAX_CHART_DATA_POINTS = 360;

/**
 * Chart sampling rate
 * Show every Nth month to reduce data points
 * For 360-month loan: show every 12 months if data exceeds MAX_CHART_DATA_POINTS
 */
export const CHART_SAMPLING_INTERVAL = 12;
