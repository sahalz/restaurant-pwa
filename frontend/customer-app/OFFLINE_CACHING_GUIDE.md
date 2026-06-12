# Offline Caching Guide for Restaurant PWA

This guide explains how offline caching works in your restaurant app, written for beginners.

## What is Offline Caching?

**Offline caching** means saving files on your device so the app works even without internet. Think of it like downloading a movie to watch later - you can watch it even when you're not connected to the internet.

## Why Do We Need It?

For a restaurant app, offline caching is crucial because:
- **Customers might have poor internet** in some areas
- **Orders shouldn't be lost** if connection drops
- **Faster loading** - cached content loads instantly
- **Better user experience** - app feels like a native app

## How Caching Works (Simple Explanation)

### The Service Worker

A **service worker** is like a helper that runs in the background of your app. It:

1. **Watches what files your app needs** (HTML, CSS, images, etc.)
2. **Saves copies of these files** on the device
3. **Serves these saved files** when you're offline
4. **Updates files** when you're back online

Think of it as a librarian who:
- Keeps copies of books you read often
- Gives you the copy when the original is unavailable
- Updates the copy when a new edition comes out

## What Gets Cached in Your App

### 1. Static Assets (Already Cached)
These are files that don't change often:
- **HTML files** - The structure of your pages
- **CSS files** - Styles and designs
- **JavaScript files** - App logic and functionality
- **Icons and fonts** - Visual elements

**How it works:** The service worker automatically caches these when you first visit the app.

### 2. Images (Already Cached)
Food images, logos, and other visual content:
- **Food item images** (🍔, 🍕, etc.)
- **App icons**
- **Background images**

**Caching Strategy:** CacheFirst
- Shows cached image immediately (fast!)
- Updates in background when online
- Keeps images for 30 days

### 3. Menu Pages (Already Cached)
The menu page and its content:
- **Food data** - List of menu items
- **Categories** - Food categories
- **Search functionality**

**Caching Strategy:** StaleWhileRevalidate
- Shows cached menu immediately
- Fetches latest data in background
- Updates cache for next visit

### 4. Cart Data (Cached in localStorage)
Your shopping cart is saved locally:
- **Items in cart** - What you want to order
- **Quantities** - How many of each item
- **Total price** - Order total

**How it works:** 
- Saved in browser's localStorage
- Persists even if you close the app
- Works offline
- Syncs with backend when online (future feature)

## Caching Strategies Explained

### CacheFirst (Best for Images)
```
1. Check cache first
2. If in cache, show it immediately
3. Update in background
4. Save for next time
```

**Why for images:** Images don't change often, and we want them to load instantly.

### NetworkFirst (Best for API Calls)
```
1. Try to fetch from internet
2. If fails, use cached version
3. Update cache when successful
```

**Why for API:** We want the latest data (prices, availability) but need fallback if offline.

### StaleWhileRevalidate (Best for HTML/CSS/JS)
```
1. Show cached version immediately
2. Fetch latest in background
3. Update cache
```

**Why for app files:** Fast loading + always have latest version.

## Current Setup in Your App

### vite.config.js Configuration
```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
  runtimeCaching: [
    {
      // API calls - try network first, fallback to cache
      urlPattern: /^https:\/\/api\.restaurantpwa\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 24 hours
        }
      }
    },
    {
      // Images - serve from cache first
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ]
}
```

### What This Means:
- **All static files** (JS, CSS, HTML) are automatically cached
- **Images** are cached for 30 days
- **API responses** are cached for 24 hours
- **Cache limits** prevent storage from getting too big

## Cart Data Persistence

### Current Implementation
```javascript
// In CartContext.jsx
const [cartItems, setCartItems] = useState(() => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
});

// Save to localStorage whenever cart changes
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
}, [cartItems]);
```

### How It Works:
1. When you add item to cart → Saved to localStorage
2. When you close app → Cart stays saved
3. When you open app offline → Cart loads from localStorage
4. When you go online → Cart syncs with backend (future)

## Testing Offline Functionality

### Step 1: Build the App
```bash
npm run build
```

### Step 2: Preview the Build
```bash
npm run preview
```

### Step 3: Test in Browser
1. Open the app in Chrome
2. Open DevTools (F12)
3. Go to **Application** tab
4. Click **Service Workers**
5. You should see "Active" status

### Step 4: Test Offline
1. In DevTools, go to **Network** tab
2. Change throttling to **Offline**
3. Refresh the page
4. App should still load!

### Step 5: Test Cart Offline
1. Add items to cart while online
2. Go offline (Network → Offline)
3. Navigate to cart page
4. Cart should still show your items
5. Try adding more items - should work offline

## What Happens When You're Offline

### Menu Page
- ✅ Shows cached menu items
- ✅ Search works (searches cached data)
- ✅ Categories work
- ❌ Can't fetch new data from backend

### Cart Page
- ✅ Shows saved cart items
- ✅ Can add/remove items
- ✅ Can view cart total
- ❌ Can't sync with backend (yet)

### Order Page
- ✅ Shows order history (cached)
- ❌ Can't place new orders (needs backend)

### Images
- ✅ All cached images load instantly
- ✅ Food emojis display correctly
- ✅ App icons work

## Cache Size Management

### Automatic Cleanup
The service worker automatically:
- **Removes old files** when cache is full
- **Keeps most-used files**
- **Deletes expired files**

### Cache Limits
- **API cache:** 50 entries, 24 hours
- **Image cache:** 100 entries, 30 days
- **Static files:** Automatic precache

### Manual Cache Clear
Users can clear cache by:
1. Browser settings → Clear browsing data
2. DevTools → Application → Clear storage
3. Uninstalling and reinstalling PWA

## Troubleshooting

### App Not Working Offline
**Problem:** App shows error when offline

**Solutions:**
1. Check service worker is active (DevTools → Application → Service Workers)
2. Clear cache and reload
3. Rebuild the app: `npm run build`
4. Check browser console for errors

### Cart Not Saving
**Problem:** Cart items disappear when closing app

**Solutions:**
1. Check localStorage is enabled in browser
2. Check browser console for errors
3. Verify CartContext is properly initialized

### Images Not Loading Offline
**Problem:** Images show broken icon when offline

**Solutions:**
1. Check if images are in cache (DevTools → Application → Cache Storage)
2. Verify image URLs are correct
3. Check image caching strategy in vite.config.js

### Stale Content
**Problem:** Showing old data instead of latest

**Solutions:**
1. Service worker updates automatically
2. Force refresh: Ctrl+Shift+R
3. Clear cache and reload

## Best Practices

### For Developers
- **Test offline regularly** - Don't assume it works
- **Keep cache sizes reasonable** - Don't cache everything
- **Use appropriate strategies** - CacheFirst for static, NetworkFirst for dynamic
- **Handle errors gracefully** - Show friendly offline message

### For Users
- **Keep app updated** - Allow updates when prompted
- **Clear cache if issues** - Fixes most caching problems
- **Use on WiFi first** - Ensures good cache before going offline

## Future Enhancements

### Background Sync
When you go back online:
- Sync cart to backend
- Sync orders placed offline
- Sync user preferences

### Push Notifications
Notify users about:
- Order status updates
- Special offers
- Delivery updates

### Smart Caching
- Cache based on user behavior
- Preload frequently accessed content
- Predictive caching

## Summary

Your restaurant app now has comprehensive offline caching:

✅ **Menu pages** - Cached and works offline
✅ **Images** - Cached for 30 days, loads instantly
✅ **Cart data** - Saved in localStorage, persists offline
✅ **Static assets** - Automatically cached by service worker
✅ **API responses** - Cached for 24 hours with fallback

The app works like a native app - fast, reliable, and available even without internet!
