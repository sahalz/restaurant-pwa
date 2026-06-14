import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, supportAPI, loyaltyAPI, offersAPI } from '../../services/api';
import {
  FaChartLine, FaClipboardList, FaHeadset, FaSignOutAlt,
  FaSync, FaCalendarAlt, FaRupeeSign, FaShoppingBag,
  FaPercentage, FaUser, FaPhone, FaEnvelope, FaGift, FaTag,
  FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaTrash
} from 'react-icons/fa';
import './AdminDashboard.css';

export const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'orders' | 'support' | 'loyalty'
  const [supportTab, setSupportTab] = useState('tickets'); // 'tickets' | 'refunds'
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [refunds, setRefunds] = useState([]);
  
  // Loyalty Settings state
  const [loyaltySettings, setLoyaltySettings] = useState({ points_per_rupee: 0.1, rupee_per_point: 0.5, min_points_to_redeem: 50 });
  const [savingLoyaltySettings, setSavingLoyaltySettings] = useState(false);

  // Offers state
  const [offers, setOffers] = useState([]);
  const [offerForm, setOfferForm] = useState({
    name: '', offer_type: 'flat', is_active: true,
    valid_until: '', valid_days: [],
    discount_percent: '', category_condition: '',
    min_spend: '', flat_discount: '',
    combo_items: '', original_price: '', offer_price: ''
  });
  const [comboItems, setComboItems] = useState(['']);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState('');
  
  // Filtering & Date selection
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [ordersRes, ticketsRes, refundsRes, loyaltyRes, offersRes] = await Promise.all([
        orderAPI.getOrders(),
        supportAPI.getSupportTickets(),
        supportAPI.getRefundRequests(),
        loyaltyAPI.getSettings().catch(err => {
          console.warn('Loyalty settings could not be fetched:', err);
          return { data: { status: 'success', data: { points_per_rupee: 0.1, rupee_per_point: 0.5, min_points_to_redeem: 50 } } };
        }),
        offersAPI.getOffers(true).catch(() => ({ data: { data: [] } }))
      ]);

      setOrders(ordersRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
      setRefunds(refundsRes.data.data || []);
      if (loyaltyRes?.data?.status === 'success') {
        setLoyaltySettings(loyaltyRes.data.data);
      }
      setOffers(offersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch manager dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveRefund = async (ticketId) => {
    setActionLoadingId(ticketId);
    try {
      await supportAPI.refundSupportTicket(ticketId);
      await fetchData(true);
      alert('Refund approved successfully!');
    } catch (error) {
      console.error('Failed to approve refund:', error);
      alert('Error approving refund');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateRefundStatus = async (id, status) => {
    setActionLoadingId(id);
    try {
      await supportAPI.updateRefundStatus(id, status);
      await fetchData(true);
      alert(`Refund request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error('Failed to update refund status:', error);
      alert('Error updating refund status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProvideCompensation = async (ticketId) => {
    setActionLoadingId(ticketId);
    try {
      await supportAPI.compensateSupportTicket(ticketId);
      await fetchData(true);
      alert('Compensation coupon details sent to customer!');
    } catch (error) {
      console.error('Failed to provide compensation:', error);
      alert('Error providing compensation');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    setActionLoadingId(ticketId);
    try {
      await supportAPI.closeSupportTicket(ticketId);
      await fetchData(true);
    } catch (error) {
      console.error('Failed to close ticket:', error);
      alert('Error closing ticket');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ======================== OFFER HANDLERS ========================
  const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const resetOfferForm = () => {
    setOfferForm({
      name: '', offer_type: 'flat', is_active: true,
      valid_until: '', valid_days: [],
      discount_percent: '', category_condition: '',
      min_spend: '', flat_discount: '',
      combo_items: '', original_price: '', offer_price: ''
    });
    setComboItems(['']);
    setEditingOffer(null);
    setOfferError('');
  };

  const handleEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      name: offer.name || '',
      offer_type: offer.offer_type || 'flat',
      is_active: offer.is_active ?? true,
      valid_until: offer.valid_until ? offer.valid_until.split('T')[0] : '',
      valid_days: offer.valid_days || [],
      discount_percent: offer.discount_percent || '',
      category_condition: offer.category_condition || '',
      min_spend: offer.min_spend || '',
      flat_discount: offer.flat_discount || '',
      combo_items: offer.combo_items ? JSON.stringify(offer.combo_items) : '',
      original_price: offer.original_price || '',
      offer_price: offer.offer_price || ''
    });
    
    if (offer.offer_type === 'combo' && Array.isArray(offer.combo_items)) {
      setComboItems(offer.combo_items.map(item => item.name || ''));
    } else {
      setComboItems(['']);
    }

    setShowOfferForm(true);
    setOfferError('');
  };

  const handleOfferFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfferForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDayToggle = (day) => {
    setOfferForm(prev => ({
      ...prev,
      valid_days: prev.valid_days.includes(day)
        ? prev.valid_days.filter(d => d !== day)
        : [...prev.valid_days, day]
    }));
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    setOfferLoading(true);
    setOfferError('');
    try {
      let formattedComboItems = null;
      if (offerForm.offer_type === 'combo') {
        const filteredItems = comboItems.filter(item => item.trim() !== '');
        if (filteredItems.length === 0) {
          throw new Error('Please add at least one combo item');
        }
        formattedComboItems = filteredItems.map(item => ({ name: item.trim() }));
      }

      const payload = {
        ...offerForm,
        valid_days: offerForm.valid_days.length > 0 ? offerForm.valid_days : null,
        valid_until: offerForm.valid_until || null,
        combo_items: formattedComboItems
      };
      if (editingOffer) {
        await offersAPI.updateOffer(editingOffer.id, payload);
      } else {
        await offersAPI.createOffer(payload);
      }
      await fetchData(true);
      resetOfferForm();
      setShowOfferForm(false);
    } catch (err) {
      setOfferError(err.message || err.response?.data?.error || 'Failed to save offer');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleToggleOffer = async (offer) => {
    try {
      await offersAPI.toggleStatus(offer.id, !offer.is_active);
      await fetchData(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle offer');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await offersAPI.deleteOffer(id);
      await fetchData(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete offer');
    }
  };
  // ======================== END OFFER HANDLERS ========================

  const handleSaveLoyaltySettings = async (e) => {
    e.preventDefault();
    setSavingLoyaltySettings(true);
    try {
      await loyaltyAPI.updateSettings(loyaltySettings);
      alert('Loyalty settings updated successfully!');
    } catch (error) {
      console.error('Failed to save loyalty settings:', error);
      alert(error.response?.data?.error || 'Failed to save loyalty settings. Please make sure the table exists.');
    } finally {
      setSavingLoyaltySettings(false);
    }
  };

  // Helper: Filter orders by selected date
  const getOrdersForDate = (dateStr) => {
    return orders.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      return orderDate === dateStr;
    });
  };

  const ordersForSelectedDate = getOrdersForDate(selectedDate);

  // Metrics calculation for the selected date
  const computeMetrics = (filteredOrdersList) => {
    const totalOrders = filteredOrdersList.length;
    const completedOrders = filteredOrdersList.filter(o => o.status === 'delivered');
    const activeOrders = filteredOrdersList.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
    const cancelledOrders = filteredOrdersList.filter(o => o.status === 'cancelled');
    
    const revenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? (revenue / totalOrders) : 0;
    
    return {
      totalOrders,
      completedOrders: completedOrders.length,
      activeOrders: activeOrders.length,
      cancelledOrders: cancelledOrders.length,
      revenue,
      avgOrderValue
    };
  };

  const metrics = computeMetrics(ordersForSelectedDate);

  // Escalated tickets count
  const escalatedTickets = tickets.filter(t => t.status === 'escalated');
  
  // Status badges colors
  const statusColors = {
    open: 'rgba(59, 130, 246, 0.1)',
    resolved: 'rgba(22, 163, 74, 0.1)',
    escalated: 'rgba(239, 68, 68, 0.1)',
    refunded: 'rgba(16, 185, 129, 0.15)',
    compensated: 'rgba(124, 58, 237, 0.15)',
    closed: 'rgba(107, 114, 128, 0.1)'
  };

  const statusTextColors = {
    open: '#3b82f6',
    resolved: '#16a34a',
    escalated: '#ef4444',
    refunded: '#059669',
    compensated: '#7c3aed',
    closed: '#6b7280'
  };

  return (
    <div className="admin-dashboard manager-theme">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <h1>🍽️ DirectDine <span>Manager Portal</span></h1>
        </div>
        <div className="admin-user-controls">
          <div className="admin-welcome-text">
            Logged in as: <strong>{user?.name || 'Manager User'}</strong> (<span style={{textTransform:'capitalize'}}>{user?.role}</span>)
          </div>
          <button 
            className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#94a3b8', 
              cursor: 'pointer', 
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            title="Refresh dashboard data"
          >
            <FaSync />
          </button>
          <button className="admin-logout-btn" onClick={logout}>
            <FaSignOutAlt /> Log Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="admin-container">
        
        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button 
            className={`admin-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <FaChartLine style={{ marginRight: '6px' }} /> Sales Report
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaClipboardList style={{ marginRight: '6px' }} /> Daily Orders ({ordersForSelectedDate.length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <FaHeadset style={{ marginRight: '6px' }} /> Support ({escalatedTickets.length + refunds.filter(r => r.status === 'Pending').length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'loyalty' ? 'active' : ''}`}
            onClick={() => setActiveTab('loyalty')}
          >
            <FaGift style={{ marginRight: '6px' }} /> Loyalty Program
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
            onClick={() => setActiveTab('offers')}
          >
            <FaTag style={{ marginRight: '6px' }} /> Offers ({offers.length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading dashboard analytics...</p>
          </div>
        ) : (
          <>
            {/* Sales Analytics Tab */}
            {activeTab === 'sales' && (
              <div className="sales-panel">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2>Sales & Performance Analytics</h2>
                  <div className="date-picker-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCalendarAlt style={{ color: '#6366f1' }} />
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="admin-metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '32px' }}>
                  <div className="metric-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="metric-icon-box" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                      <FaRupeeSign />
                    </div>
                    <div className="metric-info">
                      <h4>Daily Revenue</h4>
                      <div className="metric-number">₹{metrics.revenue.toFixed(2)}</div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>From completed orders</p>
                    </div>
                  </div>

                  <div className="metric-card" style={{ borderLeft: '4px solid #6366f1' }}>
                    <div className="metric-icon-box" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                      <FaShoppingBag />
                    </div>
                    <div className="metric-info">
                      <h4>Total Orders</h4>
                      <div className="metric-number">{metrics.totalOrders}</div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Placed today</p>
                    </div>
                  </div>

                  <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="metric-icon-box" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                      <FaPercentage />
                    </div>
                    <div className="metric-info">
                      <h4>Avg Order Value</h4>
                      <div className="metric-number">₹{metrics.avgOrderValue.toFixed(2)}</div>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Average ticket size</p>
                    </div>
                  </div>
                </div>

                {/* Order Status Breakdown Chart (Visual Cards style) */}
                <div className="performance-breakdown-section" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#1e293b' }}>Order Status Breakdown ({selectedDate})</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>✅</span>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.9rem', color: '#64748b' }}>Delivered</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{metrics.completedOrders}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>⏳</span>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.9rem', color: '#64748b' }}>Active Prep / Dispatch</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{metrics.activeOrders}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>❌</span>
                      <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.9rem', color: '#64748b' }}>Cancelled</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{metrics.cancelledOrders}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Orders Tab */}
            {activeTab === 'orders' && (
              <div className="orders-panel">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Orders list ({selectedDate})</h2>
                  <div className="date-picker-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCalendarAlt style={{ color: '#6366f1' }} />
                    <input 
                      type="date" 
                      value={selectedDate} 
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {ordersForSelectedDate.length > 0 ? (
                  <div className="orders-grid">
                    {ordersForSelectedDate.map(order => {
                      const dateObj = new Date(order.created_at);
                      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const paymentMethodStr = order.payments?.[0]?.payment_method || 'CoD';
                      const cust = order.users || {};

                      return (
                        <div key={order.id} className="admin-order-card">
                          <div className="order-card-header">
                            <div className="order-id-section">
                              <h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                              <span className="order-time">{formattedTime}</span>
                            </div>
                            <span className={`status-badge ${order.status}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="order-card-body">
                            <div className="customer-detail-box">
                              <h4>Customer Details</h4>
                              <p><FaUser size={12} /> {cust.name || 'Anonymous User'}</p>
                              {cust.phone && <p><FaPhone size={12} /> {cust.phone}</p>}
                            </div>

                            <div className="order-items-summary">
                              <h4>Items Summary</h4>
                              {(order.order_items || []).map(item => (
                                <div key={item.id} className="order-item-row">
                                  <span>{item.quantity}x {item.menu_items?.name || 'Item'}</span>
                                  <span>₹{parseFloat(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="order-card-footer">
                            <div className="order-total-amount">
                              <label>Total Price ({paymentMethodStr.toUpperCase()})</label>
                              ₹{parseFloat(order.total_amount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-state-icon">📦</span>
                    <h3>No orders for this date</h3>
                    <p>There are no orders placed on {selectedDate}.</p>
                  </div>
                )}
              </div>
            )}

            {/* Escalated Support Tab */}
            {/* Support Panel */}
            {activeTab === 'support' && (
              <div className="support-panel">
                <div className="support-subtabs">
                  <button 
                    className={`support-subtab-btn ${supportTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => setSupportTab('tickets')}
                  >
                    Escalated Tickets ({escalatedTickets.length})
                  </button>
                  <button 
                    className={`support-subtab-btn ${supportTab === 'refunds' ? 'active' : ''}`}
                    onClick={() => setSupportTab('refunds')}
                  >
                    Refund Requests ({refunds.length})
                  </button>
                </div>

                <div className="support-items-list" style={{ marginTop: '20px' }}>
                  {/* Escalated Tickets subtab */}
                  {supportTab === 'tickets' && (
                    escalatedTickets.length > 0 ? (
                      escalatedTickets.map(ticket => (
                        <div key={ticket.id} className="support-item-card" style={{ borderLeft: '4px solid #ef4444' }}>
                          <div className="support-item-header">
                            <div className="support-item-title">
                              <h3>{ticket.subject}</h3>
                              <div className="support-item-meta">
                                <span>Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}</span>
                                <span>Customer: {ticket.users?.name || 'Customer User'}</span>
                                {ticket.users?.phone && <span>Phone: {ticket.users?.phone}</span>}
                              </div>
                            </div>
                            <span 
                              className="support-badge" 
                              style={{ 
                                backgroundColor: statusColors[ticket.status] || '#f3f4f6', 
                                color: statusTextColors[ticket.status] || '#6b7280',
                                border: `1.5px solid ${statusTextColors[ticket.status] || '#cbd5e1'}`,
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontSize: '0.8rem'
                              }}
                            >
                              {ticket.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="support-description" style={{ fontSize: '0.95rem', margin: '12px 0', lineBreak: 'anywhere' }}>{ticket.description}</p>
                          
                          <div className="support-actions-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <button 
                              className="action-btn"
                              style={{ backgroundColor: '#10b981', color: '#fff' }}
                              onClick={() => handleApproveRefund(ticket.id)}
                              disabled={actionLoadingId === ticket.id}
                            >
                              {actionLoadingId === ticket.id ? 'Processing...' : '💳 Approve Refund'}
                            </button>
                            <button 
                              className="action-btn"
                              style={{ backgroundColor: '#8b5cf6', color: '#fff' }}
                              onClick={() => handleProvideCompensation(ticket.id)}
                              disabled={actionLoadingId === ticket.id}
                            >
                              {actionLoadingId === ticket.id ? 'Processing...' : '🎁 Provide Compensation'}
                            </button>
                            <button 
                              className="action-btn"
                              style={{ backgroundColor: '#4b5563', color: '#fff' }}
                              onClick={() => handleCloseTicket(ticket.id)}
                              disabled={actionLoadingId === ticket.id}
                            >
                              {actionLoadingId === ticket.id ? 'Processing...' : 'Close Ticket'}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">🎉</span>
                        <h3>All clear!</h3>
                        <p>There are no escalated support tickets pending review.</p>
                      </div>
                    )
                  )}

                  {/* Refund Requests subtab */}
                  {supportTab === 'refunds' && (
                    refunds.length > 0 ? (
                      refunds.map(refund => (
                        <div key={refund.id} className="support-item-card" style={{ borderLeft: refund.status === 'Pending' ? '4px solid #f59e0b' : '4px solid #cbd5e1' }}>
                          <div className="support-item-header">
                            <div className="support-item-title">
                              <h3>Refund Request: ₹{parseFloat(refund.amount || 0).toFixed(2)}</h3>
                              <div className="support-item-meta">
                                <span>Request ID: {refund.id.slice(0, 8).toUpperCase()}</span>
                                <span>Order ID: {refund.order_id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                                <span>Customer ID: {refund.user_id?.slice(0, 8) || 'N/A'}</span>
                              </div>
                            </div>
                            <span 
                              className="support-badge" 
                              style={{ 
                                backgroundColor: refund.status === 'Approved' ? 'rgba(22, 163, 74, 0.1)' : refund.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)', 
                                color: refund.status === 'Approved' ? '#16a34a' : refund.status === 'Pending' ? '#f59e0b' : '#6b7280',
                                border: `1.5px solid ${refund.status === 'Approved' ? '#16a34a' : refund.status === 'Pending' ? '#f59e0b' : '#cbd5e1'}`,
                                fontWeight: 'bold',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontSize: '0.8rem'
                              }}
                            >
                              {refund.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="support-description" style={{ fontSize: '0.95rem', margin: '12px 0' }}><strong>Reason:</strong> {refund.reason || 'No reason specified'}</p>
                          
                          {refund.status === 'Pending' && (
                            <div className="support-actions-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#ef4444', color: '#fff' }}
                                onClick={() => handleUpdateRefundStatus(refund.id, 'Rejected')}
                                disabled={actionLoadingId === refund.id}
                              >
                                {actionLoadingId === refund.id ? 'Loading...' : 'Reject Refund'}
                              </button>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#16a34a', color: '#fff' }}
                                onClick={() => handleUpdateRefundStatus(refund.id, 'Approved')}
                                disabled={actionLoadingId === refund.id}
                              >
                                {actionLoadingId === refund.id ? 'Loading...' : 'Approve Refund'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">💸</span>
                        <h3>No Refund Requests</h3>
                        <p>There are no refund requests currently.</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Loyalty Settings Tab */}
            {activeTab === 'loyalty' && (
              <div className="loyalty-panel" style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Loyalty Rewards Settings</h2>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '4px 0 0 0' }}>Configure the rules for earning and redeeming customer loyalty points.</p>
                </div>

                <form onSubmit={handleSaveLoyaltySettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      Points Earned per Rupee spent (Earning Rule)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="number"
                        step="0.0001"
                        min="0"
                        value={loyaltySettings.points_per_rupee}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, points_per_rupee: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '1rem', flex: 1, outline: 'none' }}
                        required
                      />
                      <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                        (e.g. 0.1000 = 1 Point per ₹10 spent)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      Rupee Value per Point redeemed (Redemption Rule)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={loyaltySettings.rupee_per_point}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, rupee_per_point: e.target.value })}
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '1rem', flex: 1, outline: 'none' }}
                        required
                      />
                      <span style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 600 }}>
                        (e.g. 0.50 = ₹0.50 discount per point)
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                      Minimum Points required to Redeem
                    </label>
                    <input 
                      type="number"
                      min="0"
                      value={loyaltySettings.min_points_to_redeem}
                      onChange={(e) => setLoyaltySettings({ ...loyaltySettings, min_points_to_redeem: parseInt(e.target.value) || 0 })}
                      style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={savingLoyaltySettings}
                    style={{
                      backgroundColor: '#6366f1',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '14px 20px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                      alignSelf: 'flex-start'
                    }}
                  >
                    {savingLoyaltySettings ? 'Saving Settings...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            )}
            {/* =========== OFFERS TAB =========== */}
            {activeTab === 'offers' && (
              <div className="loyalty-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ color: '#1e293b', margin: 0 }}>🔥 Offer Management</h2>
                  <button
                    onClick={() => { resetOfferForm(); setShowOfferForm(true); }}
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FaPlus /> Create Offer
                  </button>
                </div>

                {/* Create / Edit Form */}
                {showOfferForm && (
                  <form onSubmit={handleSaveOffer} style={{ background: '#f8fafc', borderRadius: '16px', padding: '24px', marginBottom: '28px', border: '1.5px solid #e2e8f0' }}>
                    <h3 style={{ marginBottom: '18px', color: '#6366f1' }}>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h3>
                    {offerError && <div style={{ color: '#ef4444', marginBottom: '14px', fontWeight: 600 }}>{offerError}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Offer Name *</label>
                        <input name="name" value={offerForm.name} onChange={handleOfferFormChange} required placeholder="e.g. Burger Combo" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Offer Type *</label>
                        <select name="offer_type" value={offerForm.offer_type} onChange={handleOfferFormChange} style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }}>
                          <option value="flat">Flat Discount (Spend X, Get Y Off)</option>
                          <option value="percentage">Percentage Discount</option>
                          <option value="combo">Combo Offer</option>
                        </select>
                      </div>
                    </div>

                    {/* Flat Offer Fields */}
                    {offerForm.offer_type === 'flat' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Minimum Spend (₹)</label>
                          <input type="number" name="min_spend" value={offerForm.min_spend} onChange={handleOfferFormChange} placeholder="e.g. 500" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Flat Discount (₹)</label>
                          <input type="number" name="flat_discount" value={offerForm.flat_discount} onChange={handleOfferFormChange} placeholder="e.g. 50" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                        </div>
                      </div>
                    )}

                    {/* Percentage Offer Fields */}
                    {offerForm.offer_type === 'percentage' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Discount %</label>
                          <input type="number" name="discount_percent" value={offerForm.discount_percent} onChange={handleOfferFormChange} placeholder="e.g. 20" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                        </div>
                        <div>
                          <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Applies To (Category name / leave blank for all)</label>
                          <input name="category_condition" value={offerForm.category_condition} onChange={handleOfferFormChange} placeholder="e.g. Pizzas" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                        </div>
                      </div>
                    )}

                    {/* Combo Offer Fields */}
                    {offerForm.offer_type === 'combo' && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Original Price (₹)</label>
                            <input type="number" name="original_price" value={offerForm.original_price} onChange={handleOfferFormChange} placeholder="e.g. 280" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                          </div>
                          <div>
                            <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Offer Price (₹)</label>
                            <input type="number" name="offer_price" value={offerForm.offer_price} onChange={handleOfferFormChange} placeholder="e.g. 249" style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                          </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Combo Items *</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {comboItems.map((item, index) => (
                              <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newList = [...comboItems];
                                    newList[index] = e.target.value;
                                    setComboItems(newList);
                                  }}
                                  placeholder={`e.g. Item ${index + 1}`}
                                  required
                                  style={{
                                    boxSizing: 'border-box',
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1.5px solid #cbd5e1',
                                    outline: 'none'
                                  }}
                                />
                                {comboItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newList = comboItems.filter((_, i) => i !== index);
                                      setComboItems(newList);
                                    }}
                                    style={{
                                      padding: '10px 14px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      background: '#fee2e2',
                                      color: '#ef4444',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setComboItems([...comboItems, ''])}
                              style={{
                                alignSelf: 'flex-start',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1.5px solid #6366f1',
                                background: 'transparent',
                                color: '#6366f1',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                marginTop: '4px'
                              }}
                            >
                              + Add Item
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Validity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>Valid Until (leave blank = no expiry)</label>
                        <input type="date" name="valid_until" value={offerForm.valid_until} onChange={handleOfferFormChange} style={{ boxSizing: 'border-box', width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Valid Days (none = every day)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {DAYS.map(day => (
                            <button key={day} type="button" onClick={() => handleDayToggle(day)} style={{ padding: '4px 10px', borderRadius: '20px', border: `1.5px solid ${offerForm.valid_days.includes(day) ? '#6366f1' : '#cbd5e1'}`, background: offerForm.valid_days.includes(day) ? '#6366f1' : '#f8fafc', color: offerForm.valid_days.includes(day) ? '#fff' : '#475569', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', textTransform: 'capitalize' }}>
                              {day.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <input type="checkbox" id="offer-active" name="is_active" checked={offerForm.is_active} onChange={handleOfferFormChange} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                      <label htmlFor="offer-active" style={{ fontWeight: 600, cursor: 'pointer' }}>Active (visible to customers)</label>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="submit" disabled={offerLoading} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
                        {offerLoading ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}
                      </button>
                      <button type="button" onClick={() => { setShowOfferForm(false); resetOfferForm(); }} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', padding: '12px 22px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </form>
                )}

                {/* Offers List */}
                {offers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏷️</div>
                    <p style={{ fontSize: '1.1rem' }}>No offers yet. Click <strong>Create Offer</strong> to add your first one.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {offers.map(offer => {
                      const typeColors = { flat: '#10b981', percentage: '#6366f1', combo: '#f59e0b' };
                      const typeLabels = { flat: '₹ Flat', percentage: '% Off', combo: '🎁 Combo' };
                      return (
                        <div key={offer.id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', opacity: offer.is_active ? 1 : 0.6 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b' }}>{offer.name}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', background: `${typeColors[offer.offer_type]}22`, color: typeColors[offer.offer_type] }}>{typeLabels[offer.offer_type]}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', background: offer.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)', color: offer.is_active ? '#10b981' : '#6b7280' }}>
                                {offer.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              {offer.offer_type === 'flat' && `Spend ₹${offer.min_spend} → Get ₹${offer.flat_discount} off`}
                              {offer.offer_type === 'percentage' && `${offer.discount_percent}% off${offer.category_condition ? ` on ${offer.category_condition}` : ''}`}
                              {offer.offer_type === 'combo' && `₹${offer.offer_price} (was ₹${offer.original_price})`}
                              {offer.valid_until && ` · Expires ${new Date(offer.valid_until).toLocaleDateString('en-IN')}`}
                              {offer.valid_days?.length > 0 && ` · ${offer.valid_days.map(d => d.slice(0,3)).join(', ')}`}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                            <button onClick={() => handleToggleOffer(offer)} title={offer.is_active ? 'Deactivate' : 'Activate'} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: offer.is_active ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: offer.is_active ? '#ef4444' : '#10b981', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                              {offer.is_active ? <FaToggleOn /> : <FaToggleOff />} {offer.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => handleEditOffer(offer)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'rgba(99,102,241,0.1)', color: '#6366f1', cursor: 'pointer', fontWeight: 700 }}>
                              <FaEdit />
                            </button>
                            <button onClick={() => handleDeleteOffer(offer.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
