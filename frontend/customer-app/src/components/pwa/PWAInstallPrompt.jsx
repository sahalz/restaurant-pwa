import { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './PWAInstallPrompt.css';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Clear session prompt flag on logout/unauthenticated so it triggers on next login
  useEffect(() => {
    if (!isAuthenticated) {
      sessionStorage.removeItem('pwa_prompted_session');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if the app is running in standalone (installed) mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    // Determine if the customer profile is fully onboarding completed
    const isProfileComplete = isAuthenticated && user && (
      user.role !== 'customer' || (
        user.phone && 
        user.preferred_food && 
        user.name !== 'Customer User' &&
        user.name !== 'User'
      )
    );

    const hasPromptedInSession = sessionStorage.getItem('pwa_prompted_session');

    if (isProfileComplete && deferredPrompt && !isStandalone && !hasPromptedInSession) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [isAuthenticated, user, deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    } else {
      console.log('PWA installation dismissed');
    }

    sessionStorage.setItem('pwa_prompted_session', 'true');
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_prompted_session', 'true');
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-prompt-content">
        <div className="pwa-prompt-icon">
          <span className="pwa-icon">🍔</span>
        </div>
        <div className="pwa-prompt-text">
          <h3>Install Our App</h3>
          <p>Get the full experience with offline access and faster loading</p>
        </div>
        <div className="pwa-prompt-actions">
          <button className="pwa-install-btn" onClick={handleInstall}>
            <FaDownload /> Install
          </button>
          <button className="pwa-dismiss-btn" onClick={handleDismiss}>
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};
