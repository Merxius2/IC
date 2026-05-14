import { createContext, useContext, useState, useEffect } from 'react';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';

const TaxContext = createContext();

// Netherlands Tax Brackets for different years
// Source: Belastingdienst (Dutch Tax Authority)
// IMPORTANT: Rates include both income tax AND mandatory social security contributions (premies volksverzekeringen)
const TAX_BRACKETS = {
  2024: [
    { min: 0, max: 69398, rate: 0.3735, label: '37.35%', description: 'Including social security' },
    { min: 69399, max: 187001, rate: 0.495, label: '49.50%', description: 'Including social security' },
    { min: 187002, max: Infinity, rate: 0.495, label: '49.50%', description: 'Including social security' },
  ],
  2025: [
    { min: 0, max: 73508, rate: 0.3735, label: '37.35%', description: 'Including social security' },
    { min: 73509, max: 198266, rate: 0.495, label: '49.50%', description: 'Including social security' },
    { min: 198267, max: Infinity, rate: 0.495, label: '49.50%', description: 'Including social security' },
  ],
  2026: [
    // NOTE: 2026 brackets are estimated based on inflation indexing
    // These are NOT YET SET by the Dutch government
    // Please verify and update when official rates are published
    { min: 0, max: 77885, rate: 0.3735, label: '37.35%', description: 'Including social security', isEstimated: true },
    { min: 77886, max: 211134, rate: 0.495, label: '49.50%', description: 'Including social security', isEstimated: true },
    { min: 211135, max: Infinity, rate: 0.495, label: '49.50%', description: 'Including social security', isEstimated: true },
  ],
};

// General tax credit (Algemene Heffingskorting) - with phase-out brackets per year
const GENERAL_TAX_CREDITS = {
  2024: {
    bracket1: { max: 27000, credit: 2921 },
    bracket2: { start: 27001, end: 60000, baseCredit: 2921, phaseOutRate: 0.06 },
    bracket3: { start: 60001, credit: 0 },
  },
  2025: {
    bracket1: { max: 28406, credit: 3068 },
    bracket2: { start: 28407, end: 76817, baseCredit: 3068, phaseOutRate: 0.06337 },
    bracket3: { start: 76818, credit: 0 },
  },
  2026: {
    bracket1: { max: 28406, credit: 3068 },
    bracket2: { start: 28407, end: 76817, baseCredit: 3068, phaseOutRate: 0.06337 },
    bracket3: { start: 76818, credit: 0 },
  },
};

// Earned Income Credit (Arbeidskorting) - with detailed phase-out brackets per year
const EARNED_INCOME_CREDITS = {
  2024: [
    { max: 11000, rate: 0.08 },
    { min: 11001, max: 25000, base: 880, rate: 0.28 },
    { min: 25001, max: 40000, base: 4760, rate: 0.025 },
    { min: 40001, max: 130000, base: 5135, rate: -0.065 },
    { min: 130001, credit: 0 },
  ],
  2025: [
    { max: 12169, rate: 0.08053 },
    { min: 12170, max: 26288, base: 980, rate: 0.30030 },
    { min: 26289, max: 43071, base: 5220, rate: 0.02258 },
    { min: 43072, max: 129078, base: 5599, rate: -0.06510 },
    { min: 129079, credit: 0 },
  ],
  2026: [
    { max: 12169, rate: 0.08053 },
    { min: 12170, max: 26288, base: 980, rate: 0.30030 },
    { min: 26289, max: 43071, base: 5220, rate: 0.02258 },
    { min: 43072, max: 129078, base: 5599, rate: -0.06510 },
    { min: 129079, credit: 0 },
  ],
};

export function TaxProvider({ children }) {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [taxBrackets, setTaxBrackets] = useState(TAX_BRACKETS[2025]);
  const [filingStatus, setFilingStatus] = useState('single');
  const [isLoading, setIsLoading] = useState(true);

  // Load tax preferences from cookies on mount
  useEffect(() => {
    const savedPreferences = loadFromCookie('AUDIT_TAX_PREFERENCES');
    if (savedPreferences?.selectedYear) {
      setSelectedYear(savedPreferences.selectedYear);
      setTaxBrackets(TAX_BRACKETS[savedPreferences.selectedYear] || TAX_BRACKETS[2025]);
    }
    if (savedPreferences?.filingStatus) {
      setFilingStatus(savedPreferences.filingStatus);
    }
    setIsLoading(false);
  }, []);

  const changeYear = (year) => {
    setSelectedYear(year);
    setTaxBrackets(TAX_BRACKETS[year] || TAX_BRACKETS[2025]);
    saveToCookie('AUDIT_TAX_PREFERENCES', { 
      selectedYear: year, 
      filingStatus: filingStatus 
    }, 365);
  };

  const changeFilingStatus = (status) => {
    setFilingStatus(status);
    saveToCookie('AUDIT_TAX_PREFERENCES', { 
      selectedYear: selectedYear, 
      filingStatus: status 
    }, 365);
  };

  const updateTaxBrackets = (year, newBrackets) => {
    TAX_BRACKETS[year] = newBrackets;
    if (year === selectedYear) {
      setTaxBrackets(newBrackets);
    }
  };

  const getGeneralTaxCredit = () => {
    return GENERAL_TAX_CREDITS[selectedYear] || GENERAL_TAX_CREDITS[2025];
  };

  const getEarnedIncomeCredit = () => {
    return EARNED_INCOME_CREDITS[selectedYear] || EARNED_INCOME_CREDITS[2025];
  };

  const isEstimatedYear = () => {
    return TAX_BRACKETS[selectedYear]?.some(bracket => bracket.isEstimated) || false;
  };

  return (
    <TaxContext.Provider value={{
      selectedYear,
      changeYear,
      filingStatus,
      changeFilingStatus,
      taxBrackets,
      updateTaxBrackets,
      getGeneralTaxCredit,
      getEarnedIncomeCredit,
      isEstimatedYear,
      TAX_BRACKETS,
      isLoading,
    }}>
      {children}
    </TaxContext.Provider>
  );
}

export function useTax() {
  const context = useContext(TaxContext);
  if (!context) {
    throw new Error('useTax must be used within TaxProvider');
  }
  return context;
}
