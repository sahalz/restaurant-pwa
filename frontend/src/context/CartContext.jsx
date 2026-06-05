// Cart context for cart management - Aligned with backend API
import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage or empty array (fallback for offline)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Calculate cart total whenever cartItems changes
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total and item count whenever cartItems changes
  useEffect(() => {
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotal(totalPrice);
    setItemCount(count);
  }, [cartItems]);

  // Add item to cart or increase quantity if already exists
  const addToCart = async (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
      
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });

    // TODO: Integrate with backend API when ready
    // try {
    //   await cartAPI.addToCart({ menu_item_id: item.id, quantity: 1 });
    // } catch (error) {
    //   console.error('Error adding to cart:', error);
    // }
  };

  // Remove item from cart completely
  const removeFromCart = async (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    // TODO: Integrate with backend API when ready
    // try {
    //   await cartAPI.removeFromCart(itemId);
    // } catch (error) {
    //   console.error('Error removing from cart:', error);
    // }
  };

  // Increase quantity of an item
  const increaseQuantity = async (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

    // TODO: Integrate with backend API when ready
  };

  // Decrease quantity of an item (remove if quantity becomes 0)
  const decreaseQuantity = async (itemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );

    // TODO: Integrate with backend API when ready
  };

  // Clear entire cart
  const clearCart = async () => {
    setCartItems([]);

    // TODO: Integrate with backend API when ready
    // try {
    //   await cartAPI.clearCart();
    // } catch (error) {
    //   console.error('Error clearing cart:', error);
    // }
  };

  // Fetch cart from backend (for API integration)
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.getCart();
      setCartItems(response.data.data.items);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
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
