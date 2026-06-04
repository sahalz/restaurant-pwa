import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { OfflinePage } from './pages/pwa/OfflinePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="offline" element={<OfflinePage />} />
          
          {/* Protected routes with MainLayout */}
          <Route
            path="checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
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
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Auth routes with AuthLayout */}
        <Route path="/login" element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
        </Route>
        <Route path="/signup" element={<AuthLayout />}>
          <Route index element={<SignupPage />} />
        </Route>
        <Route path="/forgot-password" element={<AuthLayout />}>
          <Route index element={<ForgotPasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
