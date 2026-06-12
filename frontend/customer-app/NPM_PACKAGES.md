# Restaurant PWA - Required NPM Packages

This document lists all npm packages needed for the Restaurant PWA frontend project with explanations for beginners.

---

## 🚀 Core React Packages

### react
- **Version:** ^18.2.0
- **What it is:** The core React library for building user interfaces
- **Why needed:** Essential for creating React components and managing the virtual DOM
- **Installation:** Already included with Vite

### react-dom
- **Version:** ^18.2.0
- **What it is:** React library for DOM rendering
- **Why needed:** Renders React components into the browser's DOM
- **Installation:** Already included with Vite

---

## 🧭 Routing

### react-router-dom
- **Version:** ^6.20.0
- **What it is:** Standard routing library for React applications
- **Why needed:** 
  - Enables navigation between different pages (Menu, Cart, Orders, Profile)
  - Handles URL changes without page reloads
  - Provides route protection for authenticated pages
  - Manages browser history
- **Key features used:** BrowserRouter, Routes, Route, Link, useNavigate, useParams
- **Example:** Navigate from Menu page to Cart page without reloading

---

## 🌐 HTTP Client

### axios
- **Version:** ^1.6.0
- **What it is:** Promise-based HTTP client for making API requests
- **Why needed:**
  - Communicates with backend API (login, get menu, place orders)
  - Handles request/response interceptors for auth tokens
  - Automatic JSON data transformation
  - Better error handling than fetch API
  - Request/response timeout handling
- **Example:** POST login credentials to backend, GET menu items from API

---

## 📱 PWA Support

### vite-plugin-pwa
- **Version:** ^0.17.0
- **What it is:** Vite plugin for Progressive Web App support
- **Why needed:**
  - Generates service worker automatically
  - Enables offline functionality
  - Creates app manifest for installability
  - Handles asset caching strategies
  - Provides update notifications
- **Features:** Offline access, install prompt, background sync

### workbox-window
- **Version:** ^7.0.0
- **What it is:** Library for service worker registration and updates
- **Why needed:**
  - Registers and manages service worker
  - Handles service worker updates
  - Provides skip waiting functionality
  - Shows update prompts to users

---

## 🎨 Icons

### lucide-react
- **Version:** ^0.294.0
- **What it is:** Modern icon library for React
- **Why needed:**
  - Beautiful, consistent icon set
  - Tree-shakeable (only includes icons you use)
  - Customizable size and color
  - SVG-based (scales perfectly)
- **Icons used:** Menu, Cart, User, Home, Settings, Search, etc.

### @heroicons/react
- **Alternative option:** ^2.0.0
- **What it is:** Heroicons library for React
- **Why needed:** Alternative icon library with different style options

---

## 🎯 UI Utilities

### clsx
- **Version:** ^2.0.0
- **What it is:** Utility for constructing className strings conditionally
- **Why needed:**
  - Simplifies conditional CSS classes
  - Cleaner than template literals for classes
  - Combines multiple class names easily
- **Example:** `clsx('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')`

### tailwind-merge
- **Version:** ^2.0.0
- **What it is:** Utility to merge Tailwind CSS classes intelligently
- **Why needed:**
  - Prevents Tailwind class conflicts
  - Removes duplicate classes
  - Maintains class precedence
- **Used with:** clsx for optimal class handling

---

## 📦 State Management

### zustand
- **Version:** ^4.4.0
- **What it is:** Lightweight state management library
- **Why needed:**
  - Simpler alternative to Redux
  - No boilerplate code
  - Easy to use with TypeScript
  - Great for cart and user state
- **Alternative:** Could use React Context API (built-in)

---

## 🎭 UI Component Library (Optional)

### @radix-ui/react-*
- **Version:** Latest
- **What it is:** Unstyled, accessible UI components
- **Why needed:**
  - Provides accessible component primitives
  - Customizable styling with Tailwind
  - Includes: Dialog, Dropdown, Toast, Tabs, etc.
- **Components:** Dialog (modals), DropdownMenu, Toast (notifications)

### class-variance-authority
- **Version:** ^0.7.0
- **What it is:** Utility for creating variant-based component styles
- **Why needed:**
  - Manages component variants (primary, secondary, danger)
  - Type-safe variant system
  - Works great with Radix UI and Tailwind

---

## 📝 Forms

### react-hook-form
- **Version:** ^7.48.0
- **What it is:** Performant form library for React
- **Why needed:**
  - Handles form validation
  - Reduces re-renders
  - Easy integration with validation schemas
  - Better performance than controlled components
- **Used for:** Login form, registration, profile update

### zod
- **Version:** ^3.22.0
- **What it is:** TypeScript-first schema validation library
- **Why needed:**
  - Validates form inputs
  - Type-safe validation
  - Works perfectly with react-hook-form
  - Human-readable error messages

---

## 🔔 Notifications

### react-hot-toast
- **Version:** ^2.4.0
- **What it is:** Beautiful toast notifications for React
- **Why needed:**
  - Shows success/error messages
  - Order confirmation notifications
  - Cart update alerts
  - No configuration needed
- **Example:** "Order placed successfully!", "Item added to cart"

### sonner
- **Version:** ^1.2.0
- **What it is:** Modern toast notification library
- **Why needed:** Alternative to react-hot-toast with different styling

---

## 🎨 Styling

### tailwindcss
- **Version:** ^3.3.0
- **What it is:** Utility-first CSS framework
- **Why needed:**
  - Rapid UI development
  - Consistent design system
  - Responsive design utilities
  - Dark mode support
- **Installation:** Required for modern React styling

### autoprefixer
- **Version:** ^10.4.0
- **What it is:** PostCSS plugin for vendor prefixes
- **Why needed:** Ensures CSS works across all browsers
- **Installation:** Included with Tailwind CSS

### postcss
- **Version:** ^8.4.0
- **What it is:** CSS transformation tool
- **Why needed:** Processes Tailwind CSS and other plugins
- **Installation:** Included with Tailwind CSS

---

## 📅 Date Handling

### date-fns
- **Version:** ^3.0.0
- **What it is:** Modern JavaScript date utility library
- **Why needed:**
  - Format order dates
  - Calculate delivery times
  - Display relative dates (e.g., "2 hours ago")
  - Lightweight compared to moment.js

---

## 🔒 Security

### js-cookie
- **Version:** ^3.0.0
- **What it is:** Simple JavaScript cookie handling
- **Why needed:**
  - Store authentication tokens
  - Manage session cookies
  - Secure cookie options

---

## 📊 Analytics (Optional)

### @vercel/analytics
- **Version:** ^1.1.0
- **What it is:** Analytics for Vercel deployments
- **Why needed:** Track user behavior and app performance

---

## 🧪 Testing (Optional)

### @testing-library/react
- **Version:** ^14.0.0
- **What it is:** Testing library for React components
- **Why needed:** Write unit and integration tests

### vitest
- **Version:** ^1.0.0
- **What it is:** Fast unit testing framework
- **Why needed:** Test components and utilities

---

## 📦 Complete Installation Command

```bash
npm install react-router-dom axios vite-plugin-pwa workbox-window lucide-react clsx tailwind-merge zustand react-hook-form zod react-hot-toast date-fns js-cookie
```

Or with development dependencies:

```bash
npm install react-router-dom axios vite-plugin-pwa workbox-window lucide-react clsx tailwind-merge zustand react-hook-form zod react-hot-toast date-fns js-cookie
npm install -D tailwindcss autoprefixer postcss
```

---

## 🎯 Package Categories Summary

### Essential (Must Have)
- react-router-dom - Routing
- axios - API calls
- vite-plugin-pwa - PWA functionality
- lucide-react - Icons
- tailwindcss - Styling

### Recommended (Should Have)
- clsx & tailwind-merge - Class management
- react-hook-form & zod - Form handling
- react-hot-toast - Notifications
- date-fns - Date formatting
- js-cookie - Token management

### Optional (Nice to Have)
- zustand - Advanced state management
- @radix-ui/react-* - UI components
- @testing-library/react - Testing

---

## 💡 Tips for Beginners

1. **Start with essentials:** Install only what you need initially
2. **Add as you go:** Install additional packages when you actually need them
3. **Read documentation:** Each package has great docs with examples
4. **Check bundle size:** Some packages add to your app's download size
5. **Use alternatives:** If a package doesn't work, try alternatives listed above
6. **Keep updated:** Regularly update packages for security and features

---

## 📝 Package.json Example

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "zustand": "^4.4.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "react-hot-toast": "^2.4.0",
    "date-fns": "^3.0.0",
    "js-cookie": "^3.0.0",
    "workbox-window": "^7.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 🔍 How to Check What's Installed

```bash
# List all installed packages
npm list

# List top-level packages
npm list --depth=0

# Check specific package version
npm list package-name
```

---

## 🚀 Quick Start Commands

```bash
# Install all essential packages
npm install react-router-dom axios lucide-react clsx tailwind-merge react-hot-toast date-fns js-cookie

# Install PWA support
npm install -D vite-plugin-pwa workbox-window

# Install Tailwind CSS
npm install -D tailwindcss autoprefixer postcss
npx tailwindcss init -p
```
