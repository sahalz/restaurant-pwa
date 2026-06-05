import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaClock, FaReceipt } from 'react-icons/fa';
import { OrderStatus } from '../../components/order/OrderStatus';
import { orderData } from '../../data/orderData';
import './OrderDetailsPage.css';

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const order = orderData.find(o => o.id === id);

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-details-container">
          <div className="order-not-found">
            <span className="not-found-icon">❌</span>
            <h2>Order Not Found</h2>
            <Link to="/orders" className="back-btn">
              <FaArrowLeft /> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="order-details-header">
          <Link to="/orders" className="back-link">
            <FaArrowLeft /> Back to Orders
          </Link>
          <h1>Order #{order.id.slice(0, 8)}</h1>
          <p className="order-date-time">
            <FaClock /> {formatDate(order.created_at)} at {formatTime(order.created_at)}
          </p>
        </div>

        <OrderStatus 
          status={order.status}
          estimatedDelivery={order.estimatedDelivery}
          actualDelivery={order.actualDelivery}
        />

        <div className="order-details-content">
          <div className="order-items-section">
            <h2><FaReceipt /> Order Items</h2>
            <div className="order-items-list">
              {order.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <span className="item-emoji">{item.image_url || item.image}</span>
                  </div>
                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <span className="quantity-label">Qty:</span>
                    <span className="quantity-value">{item.quantity}</span>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-info-section">
            <h2>Delivery Information</h2>
            <div className="info-card">
              <div className="info-row">
                <FaMapMarkerAlt />
                <div className="info-content">
                  <span className="info-label">Delivery Address</span>
                  <span className="info-value">{order.deliveryAddress}</span>
                </div>
              </div>
              <div className="info-row">
                <FaCreditCard />
                <div className="info-content">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">{order.paymentMethod}</span>
                </div>
              </div>
              <div className="info-row">
                <FaClock />
                <div className="info-content">
                  <span className="info-label">Estimated Delivery</span>
                  <span className="info-value">{order.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            <h2>Order Summary</h2>
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Delivery Fee</span>
                <span className="summary-value">$2.99</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Tax</span>
                <span className="summary-value">${(order.total_amount * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span className="summary-label total-label">Total</span>
                <span className="summary-value total-value">
                  ${(order.total_amount + 2.99 + order.total_amount * 0.08).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
