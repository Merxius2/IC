import { createContext, useContext, useState } from 'react';

const SecretSettingsContext = createContext();

export function SecretSettingsProvider({ children }) {
  const [isSecretSettingsOpen, setIsSecretSettingsOpen] = useState(false);

  const openSecretSettings = () => {
    setIsSecretSettingsOpen(true);
  };

  const closeSecretSettings = () => {
    setIsSecretSettingsOpen(false);
  };

  return (
    <SecretSettingsContext.Provider value={{ isSecretSettingsOpen, openSecretSettings, closeSecretSettings }}>
      {children}
    </SecretSettingsContext.Provider>
  );
}

export function useSecretSettings() {
  return useContext(SecretSettingsContext);
}
