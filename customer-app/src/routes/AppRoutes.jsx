// Main application routes configuration
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { HomePage } from '../pages/pwa/HomePage';
import { LoginPage } from '../pages/user/LoginPage';
import { SignupPage } from '../pages/user/SignupPage';
import { ProfilePage } from '../pages/user/ProfilePage';
import { MenuPage } from '../pages/menu/MenuPage';
import { CartPage } from '../pages/cart/CartPage';
import { CheckoutPage } from '../pages/cart/CheckoutPage';
import { OrdersPage } from '../pages/order/OrdersPage';
import { OrderDetailsPage } from '../pages/order/OrderDetailsPage';
import { OfflinePage } from '../pages/pwa/OfflinePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:orderId', element: <OrderDetailsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'offline', element: <OfflinePage /> }
    ]
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> }
    ]
  }
]);
