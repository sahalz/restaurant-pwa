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
  approved:    { bg: '#ecfdf5', color: '#059669' },
  rejected:    { bg: '#fef2f2', color: '#ef4444' },
};

export const TicketsPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('tickets'); // 'tickets' | 'complaints' | 'refunds'
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, complaintsRes, refundsRes] = await Promise.all([
        supportAPI.getSupportTickets(),
        supportAPI.getComplaints(),
        supportAPI.getRefundRequests(),
      ]);
      
      const tData = ticketsRes.data?.data || ticketsRes.data || [];
      const cData = complaintsRes.data?.data || complaintsRes.data || [];
      const rData = refundsRes.data?.data || refundsRes.data || [];
      
      setTickets(Array.isArray(tData) ? tData : []);
      setComplaints(Array.isArray(cData) ? cData : []);
      setRefunds(Array.isArray(rData) ? rData : []);
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      fetchData();
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
          <h1>Support & Requests Tracker</h1>
          <p>Track your tickets, complaints, and refund requests.</p>
        </div>

        {successMsg && <div className="form-success-banner">{successMsg}</div>}
        {error && <div className="form-error-banner">{error}</div>}

        {/* Support Subtabs Navigation */}
        <div className="support-subtabs">
          <button 
            className={`support-subtab-btn ${activeSubTab === 'tickets' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('tickets'); setShowForm(false); }}
          >
            Support Tickets ({tickets.length})
          </button>
          <button 
            className={`support-subtab-btn ${activeSubTab === 'complaints' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('complaints'); setShowForm(false); }}
          >
            Complaints ({complaints.length})
          </button>
          <button 
            className={`support-subtab-btn ${activeSubTab === 'refunds' ? 'active' : ''}`}
            onClick={() => { setActiveSubTab('refunds'); setShowForm(false); }}
          >
            Refund Requests ({refunds.length})
          </button>
        </div>

        {/* New Ticket Button - Only shown on Tickets Tab */}
        {activeSubTab === 'tickets' && (
          <button
            className="new-ticket-btn"
            style={{ marginBottom: '20px' }}
            onClick={() => { setShowForm(!showForm); setError(''); }}
          >
            <FaPlus /> {showForm ? 'Cancel' : 'New Ticket'}
          </button>
        )}

        {/* Create Ticket Form */}
        {showForm && activeSubTab === 'tickets' && (
          <form className="support-form ticket-form" style={{ marginBottom: '24px' }} onSubmit={handleSubmit}>
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

        {/* Items List */}
        <div className="tickets-list">
          {loading ? (
            <div className="tickets-loading">
              <div className="track-spinner" style={{ borderLeftColor: '#667eea' }} />
              <p>Loading your requests…</p>
            </div>
          ) : (
            <>
              {/* Tickets Tab List */}
              {activeSubTab === 'tickets' && (
                tickets.length === 0 ? (
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
                            {status}
                          </span>
                        </div>
                        <h3 className="ticket-subject">{ticket.subject || 'Support Ticket'}</h3>
                        <p className="ticket-desc">{ticket.description || '—'}</p>
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
                )
              )}

              {/* Complaints Tab List */}
              {activeSubTab === 'complaints' && (
                complaints.length === 0 ? (
                  <div className="no-tickets">
                    <FaTicketAlt className="no-tickets-icon" />
                    <p>No complaints filed yet. File a complaint under the Support Center if needed.</p>
                  </div>
                ) : (
                  complaints.map((complaint) => {
                    const cid = complaint.id;
                    const status = (complaint.status || 'open').toLowerCase();
                    const style = STATUS_COLORS[status] || STATUS_COLORS.open;
                    return (
                      <div key={cid} className="ticket-card">
                        <div className="ticket-top">
                          <div className="ticket-id">#{String(cid).slice(0, 8).toUpperCase()}</div>
                          <span
                            className="ticket-status-badge"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {status}
                          </span>
                        </div>
                        <h3 className="ticket-subject">Complaint: {complaint.issue_type}</h3>
                        <p className="ticket-desc">{complaint.description}</p>
                        {complaint.order_id && (
                          <p className="ticket-desc" style={{ marginTop: '4px', fontSize: '0.8rem', color: '#9ca3af' }}>
                            Order ID: #{complaint.order_id.slice(0, 8).toUpperCase()}
                          </p>
                        )}
                      </div>
                    );
                  })
                )
              )}

              {/* Refunds Tab List */}
              {activeSubTab === 'refunds' && (
                refunds.length === 0 ? (
                  <div className="no-tickets">
                    <FaTicketAlt className="no-tickets-icon" />
                    <p>No refund requests yet. Request a refund under the Support Center if needed.</p>
                  </div>
                ) : (
                  refunds.map((refund) => {
                    const rid = refund.id;
                    const status = (refund.status || 'pending').toLowerCase();
                    const style = STATUS_COLORS[status] || STATUS_COLORS.pending;
                    return (
                      <div key={rid} className="ticket-card">
                        <div className="ticket-top">
                          <div className="ticket-id">#{String(rid).slice(0, 8).toUpperCase()}</div>
                          <span
                            className="ticket-status-badge"
                            style={{ background: style.bg, color: style.color }}
                          >
                            {status}
                          </span>
                        </div>
                        <h3 className="ticket-subject">Refund Request: ₹{parseFloat(refund.amount || 0).toFixed(2)}</h3>
                        <p className="ticket-desc"><strong>Reason:</strong> {refund.reason}</p>
                        {refund.order_id && (
                          <p className="ticket-desc" style={{ marginTop: '4px', fontSize: '0.8rem', color: '#9ca3af' }}>
                            Order ID: #{refund.order_id.slice(0, 8).toUpperCase()}
                          </p>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

