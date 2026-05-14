import { createContext, useContext, useState, useEffect } from 'react';
import { saveToCookie, loadFromCookie } from '../lib/cookieStorage';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load dark mode preferences from cookies on mount
  useEffect(() => {
    const savedDarkMode = loadFromCookie('AUDIT_DARK_MODE_PREFERENCE');
    const savedAutoMode = loadFromCookie('AUDIT_DARK_MODE_AUTO');
    
    if (savedAutoMode !== null) {
      setIsAutoMode(savedAutoMode === 'true');
    }
    
    // If auto mode is enabled, detect system preference
    if (savedAutoMode === null || savedAutoMode === 'true') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      setIsAutoMode(true);
    } else if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true');
      setIsAutoMode(false);
    }
    
    setIsLoading(false);
  }, []);

  // Update the DOM when dark mode changes
  useEffect(() => {
    if (isLoading) return;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, isLoading]);

  // Listen for system theme changes when auto mode is enabled
  useEffect(() => {
    if (!isAutoMode) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isAutoMode]);

  const toggleDarkMode = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    if (!isAutoMode) {
      saveToCookie('AUDIT_DARK_MODE_PREFERENCE', newValue ? 'true' : 'false', 365);
    }
  };

  const toggleAutoMode = () => {
    const newAutoMode = !isAutoMode;
    setIsAutoMode(newAutoMode);
    saveToCookie('AUDIT_DARK_MODE_AUTO', newAutoMode ? 'true' : 'false', 365);
    
    if (newAutoMode) {
      // Detect and apply system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode, isAutoMode, toggleAutoMode, isLoading }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};
