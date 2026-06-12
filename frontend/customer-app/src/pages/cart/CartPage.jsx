import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import './CartPage.css';

export const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, total, itemCount, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <span className="empty-cart-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Add some delicious food to get started!</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/menu')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Your Cart</h1>
          <p className="cart-subtitle">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <CartSummary
            total={total}
            itemCount={itemCount}
            onClearCart={clearCart}
          />
        </div>
      </div>
    </div>
  );
};
