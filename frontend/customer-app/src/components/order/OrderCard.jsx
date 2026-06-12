import { Link } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaCreditCard, FaArrowRight } from 'react-icons/fa';
import { getStatusColor, getStatusLabel } from '../../utils/orderHelpers';
import { getItemEmoji } from '../../utils/emojiHelper';


export const OrderCard = ({ order }) => {
  const statusColor = getStatusColor(order.status);
  const statusLabel = getStatusLabel(order.status);

  // Format created_at date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div className="order-id">
          <h3>Order #{order.id.slice(0, 8)}</h3>
          <p className="order-date">
            <FaClock /> {formatDate(order.created_at)} at {formatTime(order.created_at)}
          </p>
        </div>
        <div className="order-status" style={{ backgroundColor: statusColor }}>
          {statusLabel}
        </div>
      </div>

      <div className="order-card-body">
        <div className="order-items-preview">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="order-item-preview">
              <span className="item-emoji">{getItemEmoji(item.name, null, item.image_url, item.image)}</span>
              <span className="item-name">{item.name}</span>
              <span className="item-quantity">×{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <span className="more-items">+{order.items.length - 3} more</span>
          )}
        </div>

        <div className="order-info">
          <div className="info-row">
            <FaMapMarkerAlt />
            <span>{order.deliveryAddress}</span>
          </div>
          <div className="info-row">
            <FaCreditCard />
            <span>{order.paymentMethod}</span>
          </div>
        </div>
      </div>

      <div className="order-card-footer">
        <div className="order-total">
          <span className="total-label">Total:</span>
          <span className="total-value">${order.total_amount.toFixed(2)}</span>
        </div>
        <Link to={`/orders/${order.id}`} className="view-details-btn">
          View Details <FaArrowRight />
        </Link>
      </div>
    </div>
  );
};
