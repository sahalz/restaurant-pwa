# React Router Setup - Restaurant PWA

This document explains the complete React Router setup for the Restaurant PWA frontend.

---

## 📋 What is React Router?

React Router is a standard library for routing in React applications. It allows you to navigate between different pages without reloading the entire page, making your app feel like a native application.

---

## 🗺️ Complete Route Structure

```
/                           → Home Page (with MainLayout)
/menu                       → Menu Page (with MainLayout)
/cart                       → Cart Page (with MainLayout)
/checkout                   → Checkout Page (with MainLayout)
/orders                     → Orders List Page (with MainLayout)
/orders/:orderId            → Order Details Page (with MainLayout)
/profile                    → User Profile Page (with MainLayout)
/offline                    → Offline Page (with MainLayout)

/auth/login                 → Login Page (with AuthLayout)
/auth/signup                → Signup Page (with AuthLayout)
```

---

## 📁 File Structure

```
src/
├── routes/
│   └── AppRoutes.jsx          # Main router configuration
├── layouts/
│   ├── MainLayout.jsx         # Layout for authenticated pages
│   └── AuthLayout.jsx         # Layout for auth pages
└── pages/
    ├── pwa/
    │   ├── HomePage.jsx
    │   └── OfflinePage.jsx
    ├── user/
    │   ├── LoginPage.jsx
    │   ├── SignupPage.jsx
    │   └── ProfilePage.jsx
    ├── menu/
    │   └── MenuPage.jsx
    ├── cart/
    │   ├── CartPage.jsx
    │   └── CheckoutPage.jsx
    └── order/
        ├── OrdersPage.jsx
        └── OrderDetailsPage.jsx
```

---

## 🔧 How It Works

### 1. Router Creation

We use `createBrowserRouter` to create the router:

```javascript
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  // Route configurations here
]);
```

**What it does:** Creates a router that manages navigation and renders the correct component based on the URL.

---

### 2. Layout Wrappers

Routes are organized by layouts to provide consistent structure:

#### MainLayout
- **Used for:** Home, Menu, Cart, Checkout, Orders, Profile, Offline
- **Contains:** Header, navigation, footer
- **Purpose:** Provides the main app shell for authenticated users

#### AuthLayout
- **Used for:** Login, Signup
- **Contains:** Centered form, minimal navigation
- **Purpose:** Clean, focused layout for authentication

---

### 3. Route Configuration

Each route is defined with:
- **path:** URL path (e.g., 'menu', 'orders/:orderId')
- **element:** Component to render
- **index:** Special route for the default path

#### Static Routes
```javascript
{ path: 'menu', element: <MenuPage /> }
```
- **Example:** `/menu` → renders MenuPage
- **Use for:** Pages that don't change based on URL

#### Dynamic Routes
```javascript
{ path: 'orders/:orderId', element: <OrderDetailsPage /> }
```
- **Example:** `/orders/123` → renders OrderDetailsPage with orderId=123
- **Use for:** Pages that need URL parameters (like order ID)
- **Access parameter:** `useParams()` hook in the component

#### Index Routes
```javascript
{ index: true, element: <HomePage /> }
```
- **Example:** `/` → renders HomePage
- **Use for:** Default page when no sub-path is specified

---

### 4. Nested Routes

Routes are nested under layouts:

```javascript
{
  path: '/',
  element: <MainLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'menu', element: <MenuPage /> },
    // More routes...
  ]
}
```

**What it does:** 
- When you visit `/menu`, React Router renders:
  1. MainLayout (the parent)
  2. MenuPage (the child, rendered inside MainLayout)

---

## 🎯 Complete Route Breakdown

### Public Routes (No Authentication Required)

| Route | Component | Layout | Description |
|-------|-----------|--------|-------------|
| `/` | HomePage | MainLayout | Landing page |
| `/menu` | MenuPage | MainLayout | Browse menu items |
| `/offline` | OfflinePage | MainLayout | Shown when offline |

### Auth Routes (Authentication Pages)

| Route | Component | Layout | Description |
|-------|-----------|--------|-------------|
| `/auth/login` | LoginPage | AuthLayout | User login |
| `/auth/signup` | SignupPage | AuthLayout | User registration |

### Protected Routes (Authentication Required)

| Route | Component | Layout | Description |
|-------|-----------|--------|-------------|
| `/cart` | CartPage | MainLayout | View shopping cart |
| `/checkout` | CheckoutPage | MainLayout | Complete order |
| `/orders` | OrdersPage | MainLayout | View order history |
| `/orders/:orderId` | OrderDetailsPage | MainLayout | View specific order |
| `/profile` | ProfilePage | MainLayout | Manage user profile |

---

## 🚀 How to Use in Your App

### Step 1: Import and Use Router in main.jsx

```javascript
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { PWAProvider } from './context/PWAContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PWAProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <RouterProvider router={router} />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </PWAProvider>
  </React.StrictMode>
);
```

**What this does:**
- Wraps your app with context providers
- Provides the router to your entire app
- Enables routing throughout the application

---

### Step 2: Navigate Between Pages

#### Using Link Component
```javascript
import { Link } from 'react-router-dom';

<Link to="/menu">View Menu</Link>
<Link to="/cart">Go to Cart</Link>
<Link to={`/orders/${orderId}`}>View Order</Link>
```

**What it does:** Creates a clickable link that navigates without page reload

#### Using useNavigate Hook
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

const handleCheckout = () => {
  navigate('/checkout');
};

const handleOrderSuccess = (orderId) => {
  navigate(`/orders/${orderId}`);
};
```

**What it does:** Programmatically navigate (useful after actions like login, checkout)

---

### Step 3: Access URL Parameters

```javascript
import { useParams } from 'react-router-dom';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  
  // Use orderId to fetch order details
  useEffect(() => {
    fetchOrderDetails(orderId);
  }, [orderId]);
  
  return <div>Order #{orderId}</div>;
};
```

**What it does:** Extracts dynamic values from the URL (like orderId from `/orders/123`)

---

### Step 4: Get Current Route Information

```javascript
import { useLocation } from 'react-router-dom';

const MenuPage = () => {
  const location = useLocation();
  
  console.log('Current path:', location.pathname);
  console.log('Search params:', location.search);
  
  return <div>Menu Page</div>;
};
```

**What it does:** Provides information about the current URL

---

## 🛡️ Route Protection (Optional)

To protect routes that require authentication, create a wrapper component:

```javascript
// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  return children;
};
```

Then use it in your routes:

```javascript
{
  path: 'profile',
  element: (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  )
}
```

---

## 📱 PWA-Specific Routing

### Offline Detection

```javascript
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isOnline && window.location.pathname !== '/offline') {
      navigate('/offline');
    }
  }, [isOnline, navigate]);
  
  return <RouterProvider router={router} />;
};
```

**What it does:** Automatically redirects to offline page when connection is lost

---

## 🎨 Adding Navigation to Layouts

### MainLayout Navigation Example

```javascript
import { Link, useLocation } from 'react-router-dom';

export const MainLayout = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="main-layout">
      <header className="header">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>
      <main className="content">
        {children}
      </main>
      <footer className="footer">
        © 2024 Restaurant PWA
      </footer>
    </div>
  );
};
```

---

## 🔍 Common Patterns

### 1. Active Link Styling

```javascript
import { Link, useLocation } from 'react-router-dom';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  );
};
```

### 2. Redirect After Action

```javascript
const handleLogin = async (credentials) => {
  await login(credentials);
  navigate('/menu'); // Redirect to menu after login
};
```

### 3. Back Navigation

```javascript
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  
  return <button onClick={() => navigate(-1)}>Back</button>;
};
```

---

## 📊 Route Summary Table

| Route | Type | Layout | Auth Required | Description |
|-------|------|--------|---------------|-------------|
| `/` | Static | MainLayout | No | Home page |
| `/menu` | Static | MainLayout | No | Browse menu |
| `/cart` | Static | MainLayout | Yes | Shopping cart |
| `/checkout` | Static | MainLayout | Yes | Complete order |
| `/orders` | Static | MainLayout | Yes | Order history |
| `/orders/:id` | Dynamic | MainLayout | Yes | Order details |
| `/profile` | Static | MainLayout | Yes | User profile |
| `/offline` | Static | MainLayout | No | Offline page |
| `/auth/login` | Static | AuthLayout | No | Login form |
| `/auth/signup` | Static | AuthLayout | No | Signup form |

---

## 💡 Tips for Beginners

1. **Start simple:** Begin with static routes, add dynamic routes later
2. **Use Link for navigation:** It's better than anchor tags for SPAs
3. **Organize by feature:** Group related routes together
4. **Use layouts:** Avoid repeating header/footer in every page
5. **Test routes:** Click through your app to ensure navigation works
6. **Handle 404s:** Add a catch-all route for unknown paths
7. **Keep routes flat:** Avoid deeply nested routes when possible

---

## 🐛 Troubleshooting

### Route Not Working
- Check if the path matches exactly
- Ensure the component is imported correctly
- Verify the router is provided to the app

### Navigation Not Updating
- Make sure you're using `Link` or `useNavigate`, not `<a>` tags
- Check that the router is at the top of your component tree

### Layout Not Showing
- Verify the layout component is imported
- Check that routes are properly nested under the layout

---

## 🚀 Next Steps

1. **Add route protection:** Implement authentication guards
2. **Add loading states:** Show loading while navigating
3. **Add error handling:** Handle route errors gracefully
4. **Add animations:** Add page transition animations
5. **Add breadcrumbs:** Show navigation path to users

---

## 📚 Additional Resources

- [React Router Documentation](https://reactrouter.com/)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [Dynamic Routes Guide](https://reactrouter.com/en/main/start/overview#dynamic-segments)
