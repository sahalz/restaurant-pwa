// PWA context for PWA features
import { createContext, useContext, useState } from 'react';

const PWAContext = createContext();

export const PWAProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  return (
    <PWAContext.Provider value={{ isOnline, deferredPrompt, setDeferredPrompt }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);
