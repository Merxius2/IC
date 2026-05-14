import { createContext, useContext, useState, useEffect } from 'react';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';

const CurrencyContext = createContext();

const CURRENCIES = {
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  USD: { symbol: '$', name: 'Dollar', code: 'USD' },
  GBP: { symbol: '£', name: 'Pound', code: 'GBP' },
  RUB: { symbol: '₽', name: 'Ruble', code: 'RUB' },
  TRY: { symbol: '₺', name: 'Lira', code: 'TRY' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('EUR');
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from cookies on mount
  useEffect(() => {
    const savedCurrency = loadFromCookie('AUDIT_CURRENCY_PREFERENCE');
    if (savedCurrency && savedCurrency.currency) {
      setCurrency(savedCurrency.currency);
    }
    setIsLoading(false);
  }, []);

  const changeCurrency = (curr) => {
    setCurrency(curr);
    saveToCookie('AUDIT_CURRENCY_PREFERENCE', { currency: curr }, 365);
  };

  const getSymbol = () => {
    return CURRENCIES[currency]?.symbol || '€';
  };

  const getCurrencyName = () => {
    return CURRENCIES[currency]?.name || 'Euro';
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, getSymbol, getCurrencyName, CURRENCIES, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
