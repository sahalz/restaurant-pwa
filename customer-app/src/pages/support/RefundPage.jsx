import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import { supportAPI, orderAPI } from '../../services/api';
import './SupportForm.css';

export const RefundPage = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [form, setForm] = useState({
    order_id: '',
    reason: '',
    amount: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    orderAPI.getOrders()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-fill amount when order is selected
      if (name === 'order_id' && value) {
        const selected = orders.find((o) => o.id === value || o.order_id === value);
        if (selected) updated.amount = (selected.total_amount || '').toString();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.order_id || !form.reason.trim()) {
      setError('Please select an order and provide a reason.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await supportAPI.requestRefund({
        order_id: form.order_id,
        reason: form.reason,
        amount: parseFloat(form.amount) || 0,
      });
      const id = res.data?.data?.id || res.data?.data?.refund_id || 'N/A';
      setSubmitted(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit refund request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="support-form-page">
        <div className="support-form-container">
          <div className="form-success">
            <div className="success-icon-wrap amber">
              <FaCheckCircle />
            </div>
            <h2>Refund Requested</h2>
            <p>Your refund request has been submitted. We'll process it within 3–5 business days.</p>
            <p className="ref-id">Reference ID: <strong>#{String(submitted).slice(0, 8).toUpperCase()}</strong></p>
            <div className="success-actions">
              <Link to="/support" className="form-btn form-btn-primary">Back to Support</Link>
              <Link to="/orders" className="form-btn form-btn-secondary">My Orders</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-form-page">
      <div className="support-form-container">

        <div className="support-form-header">
          <Link to="/support" className="form-back-link"><FaArrowLeft /> Support Center</Link>
          <div className="form-title-icon amber">
            <FaMoneyBillWave />
          </div>
          <h1>Request a Refund</h1>
          <p>Select an order and tell us why you'd like a refund.</p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="order_id">Select Order *</label>
            {ordersLoading ? (
              <p className="loading-text">Loading your orders…</p>
            ) : orders.length === 0 ? (
              <p className="loading-text">No orders found. Place an order first.</p>
            ) : (
              <select
                id="order_id"
                name="order_id"
                value={form.order_id}
                onChange={handleChange}
                required
              >
                <option value="">Choose an order…</option>
                {orders.map((o) => {
                  const oid = o.id || o.order_id;
                  return (
                    <option key={oid} value={oid}>
                      #{oid.slice(0, 8).toUpperCase()} — ${(o.total_amount || 0).toFixed(2)}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Refund Amount ($)</label>
            <input
              id="amount"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason *</label>
            <textarea
              id="reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={5}
              placeholder="Explain why you'd like a refund…"
              required
            />
          </div>

          <button type="submit" className="form-submit-btn amber-btn" disabled={submitting || ordersLoading}>
            {submitting ? 'Submitting…' : 'Submit Refund Request'}
          </button>
        </form>

      </div>
    </div>
  );
};
