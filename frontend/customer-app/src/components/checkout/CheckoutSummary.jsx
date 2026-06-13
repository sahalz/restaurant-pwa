import { useCart } from '../../context/CartContext';
import { getItemEmoji } from '../../utils/emojiHelper';

export const CheckoutSummary = ({ loyaltyDiscount = 0 }) => {
  const { cartItems, total, itemCount } = useCart();

  const deliveryFee = 2.99;
  const tax = total * 0.08;
  const finalTotal = Math.max(0, total + deliveryFee + tax - loyaltyDiscount);

  return (
    <div className="checkout-summary">
      <h2>Order Summary</h2>
      
      <div className="summary-items">
        {cartItems.map((item) => (
          <div key={item.id} className="summary-item">
            <div className="item-info">
              <span className="item-emoji">{getItemEmoji(item.name, item.category, item.image_url, item.image)}</span>
              <div className="item-details">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">×{item.quantity}</span>
              </div>
            </div>
            <span className="item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="summary-divider"></div>

      <div className="summary-totals">
        <div className="summary-row">
          <span className="label">Subtotal ({itemCount} items)</span>
          <span className="value">₹{total.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span className="label">Delivery Fee</span>
          <span className="value">₹{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span className="label">Tax</span>
          <span className="value">₹{tax.toFixed(2)}</span>
        </div>
        {loyaltyDiscount > 0 && (
          <div className="summary-row loyalty-discount-row" style={{ color: '#059669', fontWeight: '600' }}>
            <span className="label">Loyalty Discount</span>
            <span className="value">-₹{loyaltyDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="summary-divider"></div>
        <div className="summary-row total-row">
          <span className="label total-label">Total</span>
          <span className="value total-value">₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
