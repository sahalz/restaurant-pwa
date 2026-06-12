import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { PWAInstallPrompt } from './components/pwa';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <PWAInstallPrompt />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);