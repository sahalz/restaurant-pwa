import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaClock, FaReceipt, FaTruck } from 'react-icons/fa';
import { OrderStatus } from '../../components/order/OrderStatus';
import { orderAPI, addressesAPI } from '../../services/api';
import { getItemEmoji } from '../../utils/emojiHelper';
import './OrderDetailsPage.css';

export const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellationLoading, setCancellationLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const [orderRes, addressesRes] = await Promise.all([
          orderAPI.getOrderById(id),
          addressesAPI.getAddresses()
        ]);
        setOrder(orderRes.data.data);
        setAddresses(addressesRes.data.data || []);
        setError('');
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Order not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setCancellationLoading(true);
    try {
      const res = await orderAPI.cancelOrder(id);
      if (res.data.status === 'success') {
        alert('Order cancelled successfully.');
        setOrder(prev => ({
          ...prev,
          status: 'cancelled'
        }));
      } else {
        alert(res.data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      console.error('Cancel order error:', err);
      alert(err.response?.data?.error || 'Failed to cancel order. Please try again.');
    } finally {
      setCancellationLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-container">
          <div className="order-details-loading">
            <div className="order-details-spinner" />
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-page">
        <div className="order-details-container">
          <div className="order-not-found">
            <span className="not-found-icon">❌</span>
            <h2>Order Not Found</h2>
            <p>{error || 'The requested order could not be loaded.'}</p>
            <Link to="/orders" className="back-btn">
              <FaArrowLeft /> Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Map backend order structure to UI structure
  const defaultAddressStr = addresses.length > 0
    ? `${addresses[0].address}${addresses[0].landmark ? ` (Landmark: ${addresses[0].landmark})` : ''}, ${addresses[0].city}, ${addresses[0].state} - ${addresses[0].pincode}`
    : 'Default Delivery Address';

  const pm = order.payments?.[0]?.payment_method || 'Paid';
  const paymentMethod = pm === 'card' ? 'Credit Card' : pm === 'paypal' ? 'PayPal' : pm === 'cash' ? 'Cash on Delivery' : pm;

  const uiOrder = {
    id: order.id,
    created_at: order.created_at,
    status: order.status,
    total_amount: parseFloat(order.total_amount),
    paymentMethod,
    deliveryAddress: defaultAddressStr,
    estimatedDelivery: order.status === 'delivered' ? 'Delivered' : '25–40 mins',
    actualDelivery: order.status === 'delivered' ? 'Delivered' : null,
    items: (order.order_items || []).map(item => ({
      id: item.id,
      name: item.menu_items?.name || 'Menu Item',
      image_url: getItemEmoji(item.menu_items?.name, null, item.menu_items?.image_url, null),
      quantity: item.quantity,
      price: parseFloat(item.price)
    }))
  };

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="order-details-header">
          <Link to="/orders" className="back-link">
            <FaArrowLeft /> Back to Orders
          </Link>
          <div className="order-details-title-row">
            <h1>Order #{uiOrder.id.slice(0, 8).toUpperCase()}</h1>
            {uiOrder.status !== 'cancelled' && (
              <Link to={`/orders/${uiOrder.id}/track`} className="track-order-btn">
                <FaTruck /> Track Order
              </Link>
            )}
          </div>
          <p className="order-date-time">
            <FaClock /> {formatDate(uiOrder.created_at)} at {formatTime(uiOrder.created_at)}
          </p>
        </div>

        <OrderStatus 
          status={uiOrder.status}
          estimatedDelivery={uiOrder.estimatedDelivery}
          actualDelivery={uiOrder.actualDelivery}
        />

        <div className="order-details-content">
          <div className="order-items-section">
            <h2><FaReceipt /> Order Items</h2>
            <div className="order-items-list">
              {uiOrder.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <span className="item-emoji">{item.image_url}</span>
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
                  <span className="info-value">{uiOrder.deliveryAddress}</span>
                </div>
              </div>
              <div className="info-row">
                <FaCreditCard />
                <div className="info-content">
                  <span className="info-label">Payment Method</span>
                  <span className="info-value">{uiOrder.paymentMethod}</span>
                </div>
              </div>
              <div className="info-row">
                <FaClock />
                <div className="info-content">
                  <span className="info-label">Estimated Delivery</span>
                  <span className="info-value">{uiOrder.estimatedDelivery}</span>
                </div>
              </div>

              {order.restaurant_note && (
                <div className="info-row restaurant-note-info" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '12px' }}>
                  <div className="info-content">
                    <span className="info-label" style={{ fontWeight: '700' }}>Note for Restaurant</span>
                    <span className="info-value" style={{ fontStyle: 'italic', color: '#4b5563', marginTop: '4px', display: 'block' }}>"{order.restaurant_note}"</span>
                  </div>
                </div>
              )}

              {order.delivery_instructions && (order.delivery_instructions.voiceUrl || order.delivery_instructions.imageUrl || Object.values(order.delivery_instructions.options || {}).some(Boolean)) && (
                <div className="info-row delivery-instructions-info" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="info-label" style={{ fontWeight: '700' }}>Delivery Instructions</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    {order.delivery_instructions.voiceUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' }}>
                        <span>🎙️ Voice Note: {order.delivery_instructions.voiceUrl.split('_')[3] || 'Simulated Voice Instruction'}</span>
                        <button type="button" style={{ background: '#667eea', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 'bold' }} onClick={() => alert('Simulated playing voice note...')}>▶</button>
                      </div>
                    )}
                    
                    {order.delivery_instructions.imageUrl && (
                      <div style={{ marginTop: '4px', width: '100%' }}>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Location Image:</span>
                        <img src={order.delivery_instructions.imageUrl} alt="Location" style={{ maxWidth: '100%', maxHeight: '140px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                      </div>
                    )}

                    {Object.values(order.delivery_instructions.options || {}).some(Boolean) && (
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.85rem', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.entries(order.delivery_instructions.options).map(([key, val]) => {
                          if (!val) return null;
                          const labels = {
                            leaveAtDoor: '🚪 Leave at door',
                            leaveWithGuard: '👮 Leave with guard',
                            avoidCalling: '🔇 Avoid calling',
                            dontRingBell: '🔕 Don\'t ring the bell',
                            petAtHome: '🐕 Pet at home'
                          };
                          return <li key={key}>{labels[key]}</li>;
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <h2>Order Summary</h2>
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-label">Subtotal</span>
                <span className="summary-value">${uiOrder.total_amount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Delivery Fee</span>
                <span className="summary-value">$2.99</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Tax</span>
                <span className="summary-value">${(uiOrder.total_amount * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span className="summary-label total-label">Total</span>
                <span className="summary-value total-value">
                  ${(uiOrder.total_amount + 2.99 + uiOrder.total_amount * 0.08).toFixed(2)}
                </span>
              </div>
            </div>

            {uiOrder.status === 'pending' && (
              <div className="cancel-order-container">
                <button
                  className="cancel-order-action-btn"
                  onClick={handleCancelOrder}
                  disabled={cancellationLoading}
                >
                  {cancellationLoading ? 'Cancelling Order...' : 'Cancel Order'}
                </button>
                <p className="cancel-note">Note: You can only cancel an order while it is still pending.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
