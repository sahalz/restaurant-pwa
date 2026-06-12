import { useEffect, useState } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import './PWAInstallPrompt.css';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    } else {
      console.log('PWA installation dismissed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
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
