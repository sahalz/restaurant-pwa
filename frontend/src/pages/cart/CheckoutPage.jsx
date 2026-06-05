import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddressForm, PaymentMethod, CheckoutSummary } from '../../components/checkout';
import { useCart } from '../../context/CartContext';
import './CheckoutPage.css';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const handleAddressSubmit = (addressData) => {
    console.log('Address submitted:', addressData);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setIsPlacingOrder(true);

    // Simulate order placement
    setTimeout(() => {
      clearCart();
      navigate('/orders');
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Add some items to checkout</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        <div className="checkout-content">
          <div className="checkout-forms">
            <AddressForm onSubmit={handleAddressSubmit} />
            <PaymentMethod 
              selectedMethod={selectedPayment}
              onSelect={setSelectedPayment}
            />
          </div>

          <div className="checkout-sidebar">
            <CheckoutSummary />
            <button
              className="place-order-btn"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
