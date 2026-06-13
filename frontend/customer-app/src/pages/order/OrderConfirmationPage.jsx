import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaBoxOpen, FaReceipt, FaCreditCard, FaHome, FaTruck } from 'react-icons/fa';
import './OrderConfirmationPage.css';

export const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, total, paymentMethod } = location.state || {};

  // Guard: if accessed without state, redirect to home
  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  const paymentLabel = {
    card: 'Credit Card',
    paypal: 'PayPal',
    cash: 'Cash on Delivery',
  }[paymentMethod] || paymentMethod;

  const estimatedTime = paymentMethod === 'cash' ? '30–45 mins' : '25–40 mins';

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">

        {/* Animated Success Header */}
        <div className="confirmation-hero">
          <div className="success-ring">
            <FaCheckCircle className="success-icon" />
          </div>
          <h1>Order Confirmed!</h1>
          <p className="confirmation-subtitle">
            Your delicious food is being prepared. Sit back and relax!
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="confirmation-card">
          <div className="confirmation-detail-row">
            <div className="detail-icon-wrap">
              <FaReceipt />
            </div>
            <div className="detail-content">
              <span className="detail-label">Order ID</span>
              <span className="detail-value mono">#{orderId.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <div className="confirmation-detail-row">
            <div className="detail-icon-wrap">
              <FaCreditCard />
            </div>
            <div className="detail-content">
              <span className="detail-label">Payment</span>
              <span className="detail-value">{paymentLabel}</span>
            </div>
          </div>

          <div className="confirmation-detail-row">
            <div className="detail-icon-wrap">
              <FaBoxOpen />
            </div>
            <div className="detail-content">
              <span className="detail-label">Total Paid</span>
              <span className="detail-value highlight">
                ₹{typeof total === 'number' ? total.toFixed(2) : '—'}
              </span>
            </div>
          </div>

          <div className="confirmation-detail-row">
            <div className="detail-icon-wrap">
              <FaTruck />
            </div>
            <div className="detail-content">
              <span className="detail-label">Estimated Delivery</span>
              <span className="detail-value">{estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="order-progress">
          <div className="progress-step completed">
            <div className="step-dot" />
            <span>Order Placed</span>
          </div>
          <div className="progress-line active" />
          <div className="progress-step active">
            <div className="step-dot" />
            <span>Preparing</span>
          </div>
          <div className="progress-line" />
          <div className="progress-step">
            <div className="step-dot" />
            <span>On the Way</span>
          </div>
          <div className="progress-line" />
          <div className="progress-step">
            <div className="step-dot" />
            <span>Delivered</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="confirmation-actions">
          <Link
            to={`/orders/${orderId}/track`}
            className="cta-btn cta-primary"
          >
            <FaTruck /> Track My Order
          </Link>
          <Link to="/" className="cta-btn cta-secondary">
            <FaHome /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};
