import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array (fallback for offline)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Read current token to trigger cart fetching/syncing
  const token = localStorage.getItem('token');

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total and item count whenever cartItems changes
  useEffect(() => {
    const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(totalPrice);
    setItemCount(count);
  }, [cartItems]);

  // Fetch cart from backend (for API integration)
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      if (response.data && response.data.status === 'success') {
        const items = (response.data.data.items || []).map(item => ({
          id: item.menu_item_id, // align backend ID with frontend item state
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sync cart with database when user logs in or out
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [token]);

  // Add item to cart or increase quantity if already exists
  const addToCart = async (item) => {
    let newQuantity = 1;
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        newQuantity = existingItem.quantity + 1;
        return prevItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });

    if (token) {
      try {
        await cartAPI.updateCartItem(item.id, newQuantity);
      } catch (error) {
        console.error('Error adding to cart on backend:', error);
      }
    }
  };

  // Remove item from cart completely
  const removeFromCart = async (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    if (token) {
      try {
        await cartAPI.updateCartItem(itemId, 0); // setting quantity to 0 removes the item
      } catch (error) {
        console.error('Error removing from cart on backend:', error);
      }
    }
  };

  // Increase quantity of an item
  const increaseQuantity = async (itemId) => {
    let newQuantity = 1;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === itemId) {
          newQuantity = item.quantity + 1;
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );

    if (token) {
      try {
        await cartAPI.updateCartItem(itemId, newQuantity);
      } catch (error) {
        console.error('Error increasing quantity on backend:', error);
      }
    }
  };

  // Decrease quantity of an item (remove if quantity becomes 0)
  const decreaseQuantity = async (itemId) => {
    let newQuantity = 0;
    setCartItems((prevItems) => {
      const matched = prevItems.find(item => item.id === itemId);
      if (matched) {
        newQuantity = matched.quantity - 1;
      }
      return prevItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
        .filter((item) => item.quantity > 0);
    });

    if (token) {
      try {
        await cartAPI.updateCartItem(itemId, newQuantity);
      } catch (error) {
        console.error('Error decreasing quantity on backend:', error);
      }
    }
  };

  // Clear entire cart locally (order placement handles backend cart clearing)
  const clearCart = async () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        total,
        itemCount,
        loading,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
