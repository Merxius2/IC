import { createContext, useContext, useState, useEffect } from 'react';
import { loadFromCookie, saveToCookie } from '../lib/cookieStorage';
import translations from '../lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load language from cookies on mount
  useEffect(() => {
    const savedLanguage = loadFromCookie('AUDIT_LANGUAGE_PREFERENCE');
    if (savedLanguage && savedLanguage.language) {
      setLanguage(savedLanguage.language);
    }
    setIsLoading(false);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    saveToCookie('AUDIT_LANGUAGE_PREFERENCE', { language: lang }, 365);
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
