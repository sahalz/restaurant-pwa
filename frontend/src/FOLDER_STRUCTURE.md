# Restaurant PWA - Folder Structure Documentation

This document explains the folder structure for the Restaurant PWA React application.

## 📁 src/

The main source directory containing all application code.

---

## 📂 components/

**Purpose:** Contains all reusable React components organized by feature.

### components/common/
- **What it is:** Shared UI components used across the entire application
- **Examples:** Button, Input, Card, Modal, LoadingSpinner
- **Why:** Avoids code duplication and ensures consistent styling
- **Files:** Button.jsx, Input.jsx, Card.jsx, index.jsx

### components/user/
- **What it is:** Components related to user authentication and profile
- **Examples:** LoginForm, UserProfile, RegisterForm
- **Why:** Keeps user-related UI organized and reusable
- **Files:** LoginForm.jsx, UserProfile.jsx

### components/menu/
- **What it is:** Components for displaying and interacting with the menu
- **Examples:** MenuItem, MenuList, CategoryFilter, SearchBar
- **Why:** Separates menu display logic from other features
- **Files:** MenuItem.jsx, MenuList.jsx

### components/cart/
- **What it is:** Components for shopping cart functionality
- **Examples:** CartItem, CartSummary, CartIcon, AddToCartButton
- **Why:** Manages cart UI independently
- **Files:** CartItem.jsx, CartSummary.jsx

### components/order/
- **What it is:** Components for order display and management
- **Examples:** OrderCard, OrderHistory, OrderStatus, OrderTracking
- **Why:** Keeps order-related UI organized
- **Files:** OrderCard.jsx, OrderHistory.jsx

### components/pwa/
- **What it is:** Components specific to Progressive Web App features
- **Examples:** InstallPrompt, OfflineIndicator, UpdateNotification
- **Why:** Handles PWA-specific UI like install prompts and offline status
- **Files:** InstallPrompt.jsx, OfflineIndicator.jsx

---

## 📂 layouts/

**Purpose:** Contains layout components that wrap pages with common structure.

### layouts/MainLayout.jsx
- **What it is:** The main layout with header, footer, and navigation
- **Why:** Provides consistent structure across authenticated pages
- **Use:** Wraps pages like Menu, Cart, Orders, Profile

### layouts/AuthLayout.jsx
- **What it is:** Layout for authentication pages (login, register)
- **Why:** Provides different styling for auth pages
- **Use:** Wraps Login and Register pages

---

## 📂 pages/

**Purpose:** Contains page-level components that represent different routes/screens.

### pages/user/
- **LoginPage.jsx:** User login screen
- **ProfilePage.jsx:** User profile management screen

### pages/menu/
- **MenuPage.jsx:** Main menu display page with categories and items

### pages/cart/
- **CartPage.jsx:** Shopping cart page with items and checkout

### pages/order/
- **OrdersPage.jsx:** Order history and tracking page

### pages/pwa/
- **HomePage.jsx:** Landing/home page of the application

---

## 📂 context/

**Purpose:** Contains React Context providers for global state management.

### context/AuthContext.jsx
- **What it is:** Manages user authentication state (login, logout, user data)
- **Why:** Provides auth state to any component without prop drilling
- **Exports:** AuthProvider, useAuth hook

### context/CartContext.jsx
- **What it is:** Manages shopping cart state (items, totals, add/remove)
- **Why:** Centralizes cart logic for easy access across components
- **Exports:** CartProvider, useCart hook

### context/OrderContext.jsx
- **What it is:** Manages order state (current order, order history)
- **Why:** Handles order creation and status updates globally
- **Exports:** OrderProvider, useOrder hook

### context/PWAContext.jsx
- **What it is:** Manages PWA-specific state (online status, install prompt)
- **Why:** Tracks connectivity and PWA installation state
- **Exports:** PWAProvider, usePWA hook

---

## 📂 services/

**Purpose:** Contains API service functions for backend communication.

### services/api/
- **authService.js:** Handles authentication API calls (login, register, logout)
- **menuService.js:** Handles menu-related API calls (get items, search)
- **orderService.js:** Handles order API calls (create, get, update status)
- **userService.js:** Handles user profile API calls (get profile, update)

**Why:** Separates API logic from components, making code testable and reusable.

---

## 📂 hooks/

**Purpose:** Contains custom React hooks for reusable logic.

### hooks/useAuth.js
- **What it is:** Custom hook wrapping AuthContext
- **Why:** Provides clean access to auth state in components

### hooks/useCart.js
- **What it is:** Custom hook wrapping CartContext
- **Why:** Provides clean access to cart state in components

### hooks/useOrder.js
- **What it is:** Custom hook wrapping OrderContext
- **Why:** Provides clean access to order state in components

### hooks/useOnlineStatus.js
- **What it is:** Hook to track online/offline status
- **Why:** Monitors network connectivity for PWA features

### hooks/useLocalStorage.js
- **What it is:** Hook for localStorage operations
- **Why:** Simplifies saving/loading data to browser storage

---

## 📂 utils/

**Purpose:** Contains utility/helper functions for common operations.

### utils/formatCurrency.js
- **What it is:** Formats numbers as currency (e.g., $10.99)
- **Why:** Ensures consistent currency formatting across app

### utils/formatDate.js
- **What it is:** Formats dates in a readable format
- **Why:** Standardizes date display

### utils/validateEmail.js
- **What it is:** Validates email addresses
- **Why:** Reusable email validation for forms

### utils/calculateTotal.js
- **What it is:** Calculates cart total from items
- **Why:** Centralizes total calculation logic

---

## 📂 routes/

**Purpose:** Contains routing configuration for the application.

### routes/AppRoutes.jsx
- **What it is:** Main router configuration using React Router
- **Why:** Defines all application routes and their corresponding pages
- **Includes:** Route definitions, nested routes, layout wrappers

---

## 📂 assets/

**Purpose:** Contains static assets (images, icons, fonts, etc.)
- **Note:** This folder already exists in your project
- **Contents:** Images, logos, icons, fonts, SVG files

---

## 📄 Root Files

### App.jsx
- Main application component that sets up providers and router

### main.jsx
- Application entry point that renders the app

### index.css
- Global styles and CSS reset

---

## 🎯 How to Use This Structure

### Adding a New Component
1. Decide if it's common (use `components/common/`) or feature-specific (use `components/[feature]/`)
2. Create the component file
3. Export it from an index file if needed

### Adding a New Page
1. Create the page component in `pages/[feature]/`
2. Add the route in `routes/AppRoutes.jsx`
3. Wrap with appropriate layout if needed

### Adding New State
1. Create a context in `context/`
2. Create a custom hook in `hooks/`
3. Wrap your app with the provider in App.jsx

### Adding API Calls
1. Create a service function in `services/api/`
2. Call the service from your components or hooks

### Adding Utility Functions
1. Create the utility in `utils/`
2. Import and use wherever needed

---

## 📊 Module Organization

The structure is organized by these main modules:
- **User Management:** components/user, pages/user, context/AuthContext, services/api/authService, services/api/userService
- **Menu Management:** components/menu, pages/menu, context/MenuContext (if needed), services/api/menuService
- **Cart Management:** components/cart, pages/cart, context/CartContext
- **Order Management:** components/order, pages/order, context/OrderContext, services/api/orderService
- **PWA Features:** components/pwa, context/PWAContext, hooks/useOnlineStatus

---

## 🚀 Benefits of This Structure

1. **Scalability:** Easy to add new features without clutter
2. **Maintainability:** Clear organization makes code easy to find
3. **Reusability:** Common components and utilities reduce duplication
4. **Separation of Concerns:** UI, logic, and data are separated
5. **Testability:** Isolated components and services are easy to test
6. **Team Collaboration:** Clear structure helps multiple developers work together

---

## 💡 Tips for Beginners

- Start simple: Don't over-organize initially
- Group related files together
- Use descriptive file names
- Keep components small and focused
- Use index files to group exports
- Follow the existing patterns when adding new code
