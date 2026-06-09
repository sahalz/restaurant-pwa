import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { PrivateRoute } from './components/common/PrivateRoute';
import { HomePage } from './pages/pwa/HomePage';
import { LoginPage } from './pages/user/LoginPage';
import { SignupPage } from './pages/user/SignupPage';
import { ForgotPasswordPage } from './pages/user/ForgotPasswordPage';
import { ProfilePage } from './pages/user/ProfilePage';
import { MenuPage } from './pages/menu/MenuPage';
import { CartPage } from './pages/cart/CartPage';
import { CheckoutPage } from './pages/cart/CheckoutPage';
import { OrdersPage } from './pages/order/OrdersPage';
import { OrderDetailsPage } from './pages/order/OrderDetailsPage';
import { OrderConfirmationPage } from './pages/order/OrderConfirmationPage';
import { TrackOrderPage } from './pages/order/TrackOrderPage';
import { SupportPage } from './pages/support/SupportPage';
import { ComplaintPage } from './pages/support/ComplaintPage';
import { RefundPage } from './pages/support/RefundPage';
import { TicketsPage } from './pages/support/TicketsPage';
import { OfflinePage } from './pages/pwa/OfflinePage';
import { NotFoundPage } from './pages/pwa/NotFoundPage';

import { useAuth } from './context/AuthContext';
import { WelcomePage } from './pages/user/WelcomePage';
import { CompleteProfilePage } from './pages/user/CompleteProfilePage';

function App() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '18px',
        color: '#667eea'
      }}>
        <div className="spinner" style={{
          border: '4px solid rgba(0, 0, 0, 0.1)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          borderLeftColor: '#667eea',
          animation: 'spin 1s linear infinite',
          marginRight: '12px'
        }} />
        Loading...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if profile is incomplete for a customer
  const isProfileIncomplete = isAuthenticated && user?.role === 'customer' && (
    !user?.phone || 
    !user?.preferred_food || 
    user?.name === 'Customer User' ||
    user?.name === 'User'
  );

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          // Unauthenticated Flow
          <>
            <Route path="/" element={<WelcomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : isProfileIncomplete ? (
          // Profile Completion Flow
          <>
            <Route path="/" element={<CompleteProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          // Authenticated Flow (Regular app)
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="offline" element={<OfflinePage />} />

            <Route
              path="checkout"
              element={
                <PrivateRoute>
                  <CheckoutPage />
                </PrivateRoute>
              }
            />
            <Route
              path="order-confirmation"
              element={
                <PrivateRoute>
                  <OrderConfirmationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="orders"
              element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="orders/:id"
              element={
                <PrivateRoute>
                  <OrderDetailsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="orders/:id/track"
              element={
                <PrivateRoute>
                  <TrackOrderPage />
                </PrivateRoute>
              }
            />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="support"
              element={
                <PrivateRoute>
                  <SupportPage />
                </PrivateRoute>
              }
            />
            <Route
              path="support/complaint"
              element={
                <PrivateRoute>
                  <ComplaintPage />
                </PrivateRoute>
              }
            />
            <Route
              path="support/refund"
              element={
                <PrivateRoute>
                  <RefundPage />
                </PrivateRoute>
              }
            />
            <Route
              path="support/tickets"
              element={
                <PrivateRoute>
                  <TicketsPage />
                </PrivateRoute>
              }
            />

            {/* Fallback for logged-in users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
