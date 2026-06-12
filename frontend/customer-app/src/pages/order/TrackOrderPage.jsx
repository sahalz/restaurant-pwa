import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaSync, FaMotorcycle, FaCheckCircle,
  FaUtensils, FaClipboardList, FaMapMarkerAlt
} from 'react-icons/fa';
import { deliveryAPI, orderAPI } from '../../services/api';
import './TrackOrderPage.css';

const STEPS = [
  { key: 'confirmed',        label: 'Confirmed',          icon: FaClipboardList },
  { key: 'preparing',        label: 'Preparing',          icon: FaUtensils },
  { key: 'ready',            label: 'Ready for Pickup',   icon: FaUtensils },
  { key: 'rider_assigned',   label: 'Rider Assigned',     icon: FaMotorcycle },
  { key: 'out_for_delivery', label: 'Out for Delivery',   icon: FaMotorcycle },
  { key: 'delivered',        label: 'Delivered',          icon: FaCheckCircle },
];

const stepIndex = (status) => {
  const map = { 
    assigned: 0, 
    confirmed: 0, 
    preparing: 1, 
    ready: 2, 
    rider_assigned: 3, 
    out_for_delivery: 4, 
    in_transit: 4, 
    delivered: 5 
  };
  return map[status] ?? 0;
};

export const TrackOrderPage = () => {
  const { id: orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [delRes, orderRes] = await Promise.all([
        deliveryAPI.getDeliveryStatus(orderId).catch(() => ({ data: { data: null } })),
        orderAPI.getOrderById(orderId)
      ]);

      const orderData = orderRes.data.data;
      if (orderData && orderData.status === 'cancelled') {
        setError('CANCELLED');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setDelivery(delRes.data.data);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not fetch delivery status. The order may not have a rider assigned yet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const currentStep = delivery ? stepIndex(delivery.delivery_status) : 0;

  return (
    <div className="track-page">
      <div className="track-container">

        {/* Header */}
        <div className="track-header">
          <Link to={`/orders/${orderId}`} className="track-back-link">
            <FaArrowLeft /> Order Details
          </Link>
          <div className="track-title-row">
            <h1>Track Order</h1>
            <button
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={() => fetchStatus(true)}
              disabled={refreshing}
              title="Refresh status"
            >
              <FaSync />
            </button>
          </div>
          <p className="track-order-id">Order #{orderId.slice(0, 8).toUpperCase()}</p>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {loading ? (
          <div className="track-loading">
            <div className="track-spinner" />
            <p>Fetching delivery status…</p>
          </div>
        ) : error ? (
          <div className="track-error">
            {error === 'CANCELLED' ? (
              <>
                <FaMapMarkerAlt className="error-icon" style={{ color: '#e53e3e' }} />
                <p>This order has been cancelled and cannot be tracked.</p>
                <Link to="/orders" className="retry-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>Go to My Orders</Link>
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="error-icon" />
                <p>{error}</p>
                <button className="retry-btn" onClick={() => fetchStatus()}>Retry</button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Step Tracker */}
            <div className="step-tracker">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const done = idx < currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step.key} className="step-wrapper">
                    <div className={`step-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      <div className="step-icon-wrap">
                        <Icon className="step-icon" />
                      </div>
                      <span className="step-label">{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`step-connector ${done ? 'done' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Status Badge */}
            <div className="status-card">
              <div className={`status-badge status-${delivery?.delivery_status}`}>
                {delivery?.delivery_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
              </div>
              {delivery?.delivery_status === 'delivered' ? (
                <p className="status-msg">🎉 Your order has been delivered. Enjoy your meal!</p>
              ) : delivery?.delivery_status === 'out_for_delivery' || delivery?.delivery_status === 'in_transit' ? (
                <p className="status-msg">🛵 Your rider is out for delivery!</p>
              ) : delivery?.delivery_status === 'rider_assigned' ? (
                <p className="status-msg">🚴 A delivery rider has been assigned to your order.</p>
              ) : delivery?.delivery_status === 'ready' ? (
                <p className="status-msg">🥡 Your order is ready for pickup!</p>
              ) : delivery?.delivery_status === 'preparing' ? (
                <p className="status-msg">👨‍🍳 The kitchen is preparing your order.</p>
              ) : (
                <p className="status-msg">✅ Order confirmed, preparing shortly.</p>
              )}
            </div>

            {/* Rider Info */}
            {delivery?.assigned_rider && (
              <div className="rider-card">
                <div className="rider-avatar">
                  <FaMotorcycle />
                </div>
                <div className="rider-info">
                  <span className="rider-label">Your Delivery Rider</span>
                  <span className="rider-id">ID: {delivery.assigned_rider.slice(0, 8)}</span>
                </div>
              </div>
            )}
          </>
        )}

        <div className="track-footer-actions">
          <Link to="/orders" className="view-orders-link">View All Orders</Link>
        </div>

      </div>
    </div>
  );
};
