import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft, FaHeadset, FaCheckCircle, FaPlus,
  FaTicketAlt, FaSpinner
} from 'react-icons/fa';
import { supportAPI } from '../../services/api';
import './SupportForm.css';
import './TicketsPage.css';

const STATUS_COLORS = {
  open:        { bg: '#eff6ff', color: '#3b82f6' },
  resolved:    { bg: '#f0fdf4', color: '#16a34a' },
  pending:     { bg: '#fff7ed', color: '#f97316' },
  escalated:   { bg: '#fef2f2', color: '#ef4444' },
  refunded:    { bg: '#ecfdf5', color: '#059669' },
  compensated: { bg: '#faf5ff', color: '#7c3aed' },
  closed:      { bg: '#f3f4f6', color: '#6b7280' },
};

export const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await supportAPI.getSupportTickets();
      const data = res.data?.data || res.data || [];
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setError('Please fill in both subject and description.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await supportAPI.createSupportTicket(form);
      setSuccessMsg('Ticket created! Our team will respond within 24 hours.');
      setForm({ subject: '', description: '' });
      setShowForm(false);
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-form-page">
      <div className="support-form-container tickets-container">

        <div className="support-form-header">
          <Link to="/support" className="form-back-link"><FaArrowLeft /> Support Center</Link>
          <div className="form-title-icon purple">
            <FaHeadset />
          </div>
          <h1>Support Tickets</h1>
          <p>View your open tickets or create a new one.</p>
        </div>

        {successMsg && <div className="form-success-banner">{successMsg}</div>}
        {error && <div className="form-error-banner">{error}</div>}

        {/* New Ticket Button */}
        <button
          className="new-ticket-btn"
          onClick={() => { setShowForm(!showForm); setError(''); }}
        >
          <FaPlus /> {showForm ? 'Cancel' : 'New Ticket'}
        </button>

        {/* Create Ticket Form */}
        {showForm && (
          <form className="support-form ticket-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                id="subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="What is your issue about?"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your problem in detail…"
                required
              />
            </div>
            <button type="submit" className="form-submit-btn purple-btn" disabled={submitting}>
              {submitting ? <><FaSpinner className="spin-icon" /> Submitting…</> : 'Create Ticket'}
            </button>
          </form>
        )}

        {/* Tickets List */}
        <div className="tickets-list">
          {loadingTickets ? (
            <div className="tickets-loading">
              <div className="track-spinner" style={{ borderLeftColor: '#667eea' }} />
              <p>Loading tickets…</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="no-tickets">
              <FaTicketAlt className="no-tickets-icon" />
              <p>No tickets yet. Create one above if you need help.</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const tid = ticket.id || ticket.ticket_id;
              const status = (ticket.status || 'open').toLowerCase();
              const style = STATUS_COLORS[status] || STATUS_COLORS.open;
              return (
                <div key={tid} className="ticket-card">
                  <div className="ticket-top">
                    <div className="ticket-id">#{String(tid).slice(0, 8).toUpperCase()}</div>
                    <span
                      className="ticket-status-badge"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  <h3 className="ticket-subject">{ticket.subject || ticket.issue || 'Support Request'}</h3>
                  <p className="ticket-desc">{ticket.description || ticket.message || '—'}</p>
                  {ticket.created_at && (
                    <p className="ticket-date">
                      {new Date(ticket.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
