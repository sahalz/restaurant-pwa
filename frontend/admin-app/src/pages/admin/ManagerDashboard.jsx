import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, supportAPI } from '../../services/api';
import { 
  FaChartLine, FaClipboardList, FaHeadset, FaSignOutAlt, 
  FaSync, FaCalendarAlt, FaDollarSign, FaShoppingBag, 
  FaPercentage, FaUser, FaPhone, FaEnvelope 
} from 'react-icons/fa';
import './AdminDashboard.css';

export const ManagerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('sales'); // 'sales' | 'orders' | 'support'
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [refunds, setRefunds] = useState([]);
  
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
      const [ordersRes, ticketsRes, refundsRes] = await Promise.all([
        orderAPI.getOrders(),
        supportAPI.getSupportTickets(),
        supportAPI.getRefundRequests()
      ]);
      
      setOrders(ordersRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
      setRefunds(refundsRes.data.data || []);
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
            <FaHeadset style={{ marginRight: '6px' }} /> Escalated Support ({escalatedTickets.length})
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
                      <FaDollarSign />
                    </div>
                    <div className="metric-info">
                      <h4>Daily Revenue</h4>
                      <div className="metric-number">${metrics.revenue.toFixed(2)}</div>
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
                      <div className="metric-number">${metrics.avgOrderValue.toFixed(2)}</div>
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
                                  <span>${parseFloat(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="order-card-footer">
                            <div className="order-total-amount">
                              <label>Total Price ({paymentMethodStr.toUpperCase()})</label>
                              ${parseFloat(order.total_amount).toFixed(2)}
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
            {activeTab === 'support' && (
              <div className="support-panel">
                <div className="panel-header">
                  <h2>Escalated Support Tickets</h2>
                  <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Review and resolve issues requiring manager-level refund approval or customer compensation</p>
                </div>

                <div className="support-items-list" style={{ marginTop: '20px' }}>
                  {escalatedTickets.length > 0 ? (
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
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
