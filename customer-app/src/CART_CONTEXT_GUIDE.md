# Cart Context API - Beginner's Guide

## What is React Context API?

Think of Context API as a **global state manager**. Instead of passing data through many layers of components (called "prop drilling"), Context allows you to make data available to any component in your app.

**Analogy**: Think of it like a public announcement system. Instead of telling each person individually, you make an announcement that everyone can hear.

---

## Step 1: Understanding the Cart Context Structure

### File Location
`src/context/CartContext.jsx`

### What We're Building
A shopping cart that:
- Remembers items even after page refresh (localStorage)
- Calculates total price automatically
- Lets you add, remove, and change quantities
- Works anywhere in your app

---

## Step 2: Creating the Context

```javascript
import { createContext, useContext, useState, useEffect } from 'react';

// Create the context (like creating a container for our data)
const CartContext = createContext();
```

**Explanation**:
- `createContext()` creates a "container" to hold our cart data
- This container can be accessed by any component in our app

---

## Step 3: Setting Up State

```javascript
export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
```

**Explanation**:
- `useState` creates a variable that can change over time
- We use a **function** in useState to check localStorage first
- If localStorage has cart data, use it; otherwise start with empty array
- This makes the cart **persistent** (survives page refresh)

**Why use a function in useState?**
```javascript
// ❌ BAD - This runs on every render
useState(localStorage.getItem('cart'))

// ✅ GOOD - This runs only once
useState(() => localStorage.getItem('cart'))
```

---

## Step 4: Calculating Totals Automatically

```javascript
const [total, setTotal] = useState(0);
const [itemCount, setItemCount] = useState(0);

// Calculate total whenever cartItems changes
useEffect(() => {
  const totalPrice = cartItems.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  setTotal(totalPrice);
  setItemCount(count);
}, [cartItems]);
```

**Explanation**:
- `useEffect` runs code when something changes
- We watch `cartItems` - whenever it changes, we recalculate totals
- `reduce()` is a method that adds up all values in an array
- `sum + (item.price * item.quantity)` = price × quantity for each item

**How reduce works**:
```javascript
[10, 20, 30].reduce((sum, num) => sum + num, 0)
// Step 1: sum=0, num=10 → returns 10
// Step 2: sum=10, num=20 → returns 30
// Step 3: sum=30, num=30 → returns 60
// Final result: 60
```

---

## Step 5: Saving to localStorage

```javascript
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cartItems));
}, [cartItems]);
```

**Explanation**:
- Whenever `cartItems` changes, save it to localStorage
- `JSON.stringify()` converts JavaScript object to string (localStorage only stores strings)
- This makes cart data survive browser refresh

**localStorage vs sessionStorage**:
- `localStorage`: Persists even after browser closes
- `sessionStorage`: Cleared when browser closes

---

## Step 6: Adding Items to Cart

```javascript
const addToCart = (item) => {
  setCartItems((prevItems) => {
    // Check if item already exists
    const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
    
    if (existingItem) {
      // Item exists - increase quantity
      return prevItems.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      // Item doesn't exist - add it
      return [...prevItems, { ...item, quantity: 1 }];
    }
  });
};
```

**Explanation**:
- We use **functional update** `(prevItems) => ...` to ensure we have the latest state
- `find()` checks if item already exists in cart
- If exists: use `map()` to update quantity of that item
- If doesn't exist: use spread operator `[...prevItems, newItem]` to add new item

**Key Concepts**:
- `find()`: Returns first item that matches condition
- `map()`: Creates new array by transforming each item
- Spread operator `...`: Copies all items from array

---

## Step 7: Removing Items

```javascript
const removeFromCart = (itemId) => {
  setCartItems((prevItems) => 
    prevItems.filter((item) => item.id !== itemId)
  );
};
```

**Explanation**:
- `filter()` creates new array with only items that pass the test
- `item.id !== itemId` means "keep items where ID doesn't match"
- This removes the item with matching ID

---

## Step 8: Changing Quantity

```javascript
const increaseQuantity = (itemId) => {
  setCartItems((prevItems) =>
    prevItems.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    )
  );
};

const decreaseQuantity = (itemId) => {
  setCartItems((prevItems) =>
    prevItems
      .map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0) // Remove if quantity is 0
  );
};
```

**Explanation**:
- `increaseQuantity`: Find item by ID and add 1 to quantity
- `decreaseQuantity`: Find item by ID, subtract 1, then filter out items with 0 quantity
- This prevents negative quantities

---

## Step 9: Providing the Context

```javascript
return (
  <CartContext.Provider
    value={{
      cartItems,
      total,
      itemCount,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
    }}
  >
    {children}
  </CartContext.Provider>
);
```

**Explanation**:
- `CartContext.Provider` wraps components that need cart access
- `value` prop contains all the data and functions we want to share
- Any component inside this wrapper can access these values

---

## Step 10: Using the Context in Components

```javascript
import { useCart } from '../../context/CartContext';

export const MyComponent = () => {
  const { cartItems, total, addToCart } = useCart();
  
  return (
    <div>
      <p>Total: ${total}</p>
      <p>Items: {cartItems.length}</p>
      <button onClick={() => addToCart(foodItem)}>
        Add to Cart
      </button>
    </div>
  );
};
```

**Explanation**:
- `useCart()` hook gives us access to all cart data and functions
- We can destructure only what we need: `const { cartItems, total } = useCart()`

---

## Step 11: Wrapping the App

In `src/main.jsx`:

```javascript
import { CartProvider } from './context/CartContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>  {/* 👈 Wrap your app here */}
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>
);
```

**Explanation**:
- We wrap the entire app with `CartProvider`
- This makes cart available to ALL components in the app
- Order matters: AuthProvider wraps CartProvider wraps App

---

## Complete Data Flow

```
User clicks "Add to Cart"
    ↓
Component calls addToCart(item)
    ↓
CartContext updates cartItems state
    ↓
useEffect detects cartItems changed
    ↓
1. Save to localStorage
2. Recalculate total
    ↓
All components using useCart() re-render with new data
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Not using functional updates
```javascript
// BAD - might use stale state
setCartItems([...cartItems, newItem]);

// GOOD - always has latest state
setCartItems((prev) => [...prev, newItem]);
```

### ❌ Mistake 2: Forgetting localStorage
```javascript
// BAD - cart clears on refresh
const [cartItems, setCartItems] = useState([]);

// GOOD - cart persists
const [cartItems, setCartItems] = useState(() => {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
});
```

### ❌ Mistake 3: Not wrapping app with Provider
```javascript
// BAD - useCart() won't work
<CartProvider>
  <Navbar />
</CartProvider>
<App />

// GOOD - entire app has access
<CartProvider>
  <App />
</CartProvider>
```

---

## Testing the Cart

```javascript
// In any component:
const { addToCart, cartItems, total } = useCart();

// Test adding
addToCart({ id: 1, name: 'Burger', price: 10 });

// Check console
console.log(cartItems); // Should show the burger
console.log(total);    // Should show 10
```

---

## Summary

**What we built**:
1. ✅ Cart state that persists (localStorage)
2. ✅ Add items to cart
3. ✅ Remove items from cart
4. ✅ Increase/decrease quantity
5. ✅ Automatic total calculation
6. ✅ Available anywhere in the app

**Key React concepts learned**:
- `useState` - Managing component state
- `useEffect` - Running code when state changes
- `useContext` - Sharing data across components
- Functional updates - Ensuring latest state
- localStorage - Persisting data in browser

**Next steps**:
- Create a Cart page to display items
- Add checkout functionality
- Integrate with backend API
