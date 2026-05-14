import { createContext, useContext, useState, useEffect } from 'react';
import { saveToCookie, loadFromCookie } from '../lib/cookieStorage';

const RainbowModeContext = createContext();

export function RainbowModeProvider({ children }) {
  const [isRainbow, setIsRainbow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load from cookie on mount
  useEffect(() => {
    const savedRainbow = loadFromCookie('AUDIT_RAINBOW_MODE_PREFERENCE');
    if (savedRainbow !== null) {
      setIsRainbow(savedRainbow);
    }
    setIsLoading(false);
  }, []);

  const toggleRainbow = () => {
    const newValue = !isRainbow;
    setIsRainbow(newValue);
    saveToCookie('AUDIT_RAINBOW_MODE_PREFERENCE', newValue, 365);
  };

  return (
    <RainbowModeContext.Provider value={{ isRainbow, toggleRainbow, isLoading }}>
      {children}
    </RainbowModeContext.Provider>
  );
}

export function useRainbowMode() {
  return useContext(RainbowModeContext);
}
