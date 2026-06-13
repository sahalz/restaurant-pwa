import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

export const CartSummary = ({ total, itemCount, onClearCart }) => {
  return (
    <div className="cart-summary">
      <div className="summary-content">
        <h2 className="summary-title">Order Summary</h2>
        
        <div className="summary-row">
          <span className="summary-label">Subtotal ({itemCount} items)</span>
          <span className="summary-value">₹{total.toFixed(2)}</span>
        </div>
        
        <div className="summary-row">
          <span className="summary-label">Delivery Fee</span>
          <span className="summary-value">₹2.99</span>
        </div>
        
        <div className="summary-row">
          <span className="summary-label">Tax</span>
          <span className="summary-value">₹{(total * 0.08).toFixed(2)}</span>
        </div>
        
        <div className="summary-divider"></div>
        
        <div className="summary-row total-row">
          <span className="summary-label total-label">Total</span>
          <span className="summary-value total-value">₹{(total + 2.99 + total * 0.08).toFixed(2)}</span>
        </div>
        
        <Link to="/checkout" className="checkout-btn">
          Proceed to Checkout <FaArrowRight />
        </Link>
        
        <button className="clear-cart-btn" onClick={onClearCart}>
          Clear Cart
        </button>
      </div>
    </div>
  );
};
