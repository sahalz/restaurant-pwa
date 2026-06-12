import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { supportAPI } from '../../services/api';
import './SupportForm.css';

const ISSUE_TYPES = [
  'Wrong Order',
  'Missing Item',
  'Late Delivery',
  'Cold Food',
  'Poor Packaging',
  'Rude Service',
  'Other',
];

export const ComplaintPage = () => {
  const [form, setForm] = useState({
    order_id: '',
    issue_type: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null); // stores complaint id on success
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.issue_type || !form.description.trim()) {
      setError('Please select an issue type and provide a description.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await supportAPI.fileComplaint({
        order_id: form.order_id || null,
        issue_type: form.issue_type,
        description: form.description,
      });
      const id = res.data?.data?.id || res.data?.data?.complaint_id || 'N/A';
      setSubmitted(id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="support-form-page">
        <div className="support-form-container">
          <div className="form-success">
            <div className="success-icon-wrap green">
              <FaCheckCircle />
            </div>
            <h2>Complaint Submitted</h2>
            <p>Your complaint has been received. Our team will review it within 24 hours.</p>
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
          <div className="form-title-icon red">
            <FaExclamationTriangle />
          </div>
          <h1>File a Complaint</h1>
          <p>Tell us what went wrong and we'll make it right.</p>
        </div>

        {error && <div className="form-error-banner">{error}</div>}

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="issue_type">Issue Type *</label>
            <select
              id="issue_type"
              name="issue_type"
              value={form.issue_type}
              onChange={handleChange}
              required
            >
              <option value="">Select an issue…</option>
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="order_id">Order ID <span className="optional">(optional)</span></label>
            <input
              id="order_id"
              type="text"
              name="order_id"
              value={form.order_id}
              onChange={handleChange}
              placeholder="e.g. a1b2c3d4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              placeholder="Describe your issue in detail…"
              required
            />
          </div>

          <button type="submit" className="form-submit-btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </form>

      </div>
    </div>
  );
};
