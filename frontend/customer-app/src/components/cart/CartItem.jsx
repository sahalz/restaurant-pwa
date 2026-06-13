import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
import { getItemEmoji } from '../../utils/emojiHelper';

export const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
  const isUrl = item.image_url && (item.image_url.startsWith('http') || item.image_url.startsWith('/') || item.image_url.startsWith('data:'));

  return (
    <div className="cart-item">
      <div className="cart-item-image" style={{ padding: isUrl ? '0px' : '20px' }}>
        {isUrl ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="cart-item-img" 
            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
          />
        ) : (
          <span className="food-emoji">{getItemEmoji(item.name, item.category, item.image_url, item.image)}</span>
        )}
      </div>
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.name}</h3>
        <p className="cart-item-category">{item.category}</p>
        <p className="cart-item-price">₹{item.price}</p>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-control">
          <button
            className="quantity-btn"
            onClick={() => onDecrease(item.id)}
            aria-label="Decrease quantity"
          >
            <FaMinus />
          </button>
          <span className="quantity-value">{item.quantity}</span>
          <button
            className="quantity-btn"
            onClick={() => onIncrease(item.id)}
            aria-label="Increase quantity"
          >
            <FaPlus />
          </button>
        </div>
        <button
          className="remove-btn"
          onClick={() => onRemove(item.id)}
          aria-label="Remove item"
        >
          <FaTrash /> Remove
        </button>
      </div>
      <div className="cart-item-total">
        <span className="total-label">Total:</span>
        <span className="total-value">₹{(item.price * item.quantity).toFixed(2)}</span>
      </div>
    </div>
  );
};
