import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, supportAPI } from '../../services/api';
import { 
  FaClipboardList, FaHeadset, FaExclamationTriangle, 
  FaSignOutAlt, FaSync, FaPhone, FaEnvelope, FaUser 
} from 'react-icons/fa';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'support'
  const [orders, setOrders] = useState([]);
  
  // Support state
  const [supportTab, setSupportTab] = useState('tickets'); // 'tickets' | 'complaints' | 'refunds'
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [refunds, setRefunds] = useState([]);
  
  // Loading & Action states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  
  // Orders filter status
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const [ordersRes, ticketsRes, complaintsRes, refundsRes] = await Promise.all([
        orderAPI.getOrders(),
        supportAPI.getSupportTickets(),
        supportAPI.getComplaints(),
        supportAPI.getRefundRequests()
      ]);
      
      setOrders(ordersRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
      setComplaints(complaintsRes.data.data || []);
      setRefunds(refundsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, currentStatus) => {
    setActionLoadingId(orderId);
    
    // Map current status to next status in workflow:
    // Confirmed -> Preparing -> Ready For Pickup -> Out For Delivery -> Delivered
    let nextStatus = '';
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready' || currentStatus === 'ready_for_pickup') nextStatus = 'out_for_delivery';
    else if (currentStatus === 'out_for_delivery' || currentStatus === 'in_transit') nextStatus = 'delivered';
    
    if (!nextStatus) {
      setActionLoadingId(null);
      return;
    }

    try {
      await orderAPI.updateOrderStatus(orderId, nextStatus);
      // Refresh local list
      await fetchData(true);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error updating order status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateSupportStatus = async (type, id, newStatus) => {
    setActionLoadingId(id);
    try {
      if (type === 'ticket') {
        await supportAPI.updateSupportTicketStatus(id, newStatus);
      } else if (type === 'complaint') {
        await supportAPI.updateComplaintStatus(id, newStatus);
      } else if (type === 'refund') {
        await supportAPI.updateRefundStatus(id, newStatus);
      }
      await fetchData(true);
    } catch (error) {
      console.error(`Failed to update ${type} status:`, error);
      alert(`Error updating ${type} status`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Get filtered orders
  const getFilteredOrders = () => {
    if (orderFilter === 'all') return orders;
    return orders.filter(o => o.status === orderFilter);
  };

  const filteredOrders = getFilteredOrders();

  // Metrics calculation
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const activeSupportCount = tickets.filter(t => t.status === 'open').length + 
                             complaints.filter(c => c.status === 'open').length;
  const openComplaintsCount = complaints.filter(c => c.status === 'open').length;

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-logo">
          <h1>🍽️ DirectDine <span>Admin Portal</span></h1>
        </div>
        <div className="admin-user-controls">
          <div className="admin-welcome-text">
            Logged in as: <strong>{user?.name || 'Staff User'}</strong> ({user?.role})
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

      {/* Main Admin Container */}
      <div className="admin-container">
        
        {/* Metrics Grid */}
        <div className="admin-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box orders">
              <FaClipboardList />
            </div>
            <div className="metric-info">
              <h4>Pending Orders</h4>
              <div className="metric-number">{pendingOrdersCount}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-box orders" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <FaClipboardList />
            </div>
            <div className="metric-info">
              <h4>Preparing</h4>
              <div className="metric-number">{preparingOrdersCount}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-box tickets">
              <FaHeadset />
            </div>
            <div className="metric-info">
              <h4>Open Tickets</h4>
              <div className="metric-number">{tickets.filter(t => t.status === 'open').length}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon-box complaints">
              <FaExclamationTriangle />
            </div>
            <div className="metric-info">
              <h4>Open Complaints</h4>
              <div className="metric-number">{openComplaintsCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs-nav">
          <button 
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Active Orders ({orders.filter(o => o.status !== 'delivered').length})
          </button>
          <button 
            className={`admin-tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            Customer Support ({activeSupportCount + refunds.filter(r => r.status === 'Pending').length})
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Orders Panel */}
            {activeTab === 'orders' && (
              <div className="orders-panel">
                <div className="panel-header">
                  <h2>Order Management</h2>
                  <div className="orders-filter-bar">
                    <button 
                      className={`order-filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setOrderFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`order-filter-btn ${orderFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setOrderFilter('pending')}
                    >
                      Pending
                    </button>
                    <button 
                      className={`order-filter-btn ${orderFilter === 'preparing' ? 'active' : ''}`}
                      onClick={() => setOrderFilter('preparing')}
                    >
                      Preparing
                    </button>
                    <button 
                      className={`order-filter-btn ${orderFilter === 'ready' ? 'active' : ''}`}
                      onClick={() => setOrderFilter('ready')}
                    >
                      Ready for Pickup
                    </button>
                    <button 
                      className={`order-filter-btn ${orderFilter === 'out_for_delivery' ? 'active' : ''}`}
                      onClick={() => setOrderFilter('out_for_delivery')}
                    >
                      Out for Delivery
                    </button>
                    <button 
                      className={`order-filter-btn ${orderFilter === 'delivered' ? 'active' : ''}`}
                      onClick={() => setOrderFilter('delivered')}
                    >
                      Delivered
                    </button>
                  </div>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="orders-grid">
                    {filteredOrders.map(order => {
                      const dateObj = new Date(order.created_at);
                      const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + dateObj.toLocaleDateString();
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
                            {/* Customer details */}
                            <div className="customer-detail-box">
                              <h4>Customer Information</h4>
                              <p><FaUser size={12} /> {cust.name || 'Anonymous User'}</p>
                              {cust.phone && <p><FaPhone size={12} /> {cust.phone}</p>}
                              {cust.email && <p><FaEnvelope size={12} /> {cust.email}</p>}
                            </div>

                            {/* Order items */}
                            <div className="order-items-summary">
                              <h4>Items Ordered</h4>
                              {(order.order_items || []).map(item => (
                                <div key={item.id} className="order-item-row">
                                  <span>
                                    <span className="order-item-qty">{item.quantity}x</span>
                                    {item.menu_items?.name || 'Menu Item'}
                                  </span>
                                  <span>${parseFloat(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="order-card-footer">
                            <div className="order-total-amount">
                              <label>Total Amount ({paymentMethodStr.toUpperCase()})</label>
                              ${parseFloat(order.total_amount).toFixed(2)}
                            </div>
                            
                            {/* Status actions */}
                            <div className="status-actions-container">
                              {order.status === 'pending' && (
                                <button 
                                  className="action-btn"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'pending')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Accept & Prepare'}
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button 
                                  className="action-btn"
                                  style={{ backgroundColor: '#7c3aed' }}
                                  onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Mark Ready'}
                                </button>
                              )}
                              {(order.status === 'ready' || order.status === 'ready_for_pickup') && (
                                <button 
                                  className="action-btn"
                                  style={{ backgroundColor: '#0d9488' }}
                                  onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Dispatch Order'}
                                </button>
                              )}
                              {(order.status === 'out_for_delivery' || order.status === 'in_transit') && (
                                <button 
                                  className="action-btn"
                                  style={{ backgroundColor: '#16a34a' }}
                                  onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                                  disabled={actionLoadingId === order.id}
                                >
                                  {actionLoadingId === order.id ? 'Loading...' : 'Mark Delivered'}
                                </button>
                              )}
                              {order.status === 'delivered' && (
                                <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                  ✓ Order Completed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-state-icon">📦</span>
                    <h3>No orders found</h3>
                    <p>There are no active orders matching this status filter.</p>
                  </div>
                )}
              </div>
            )}

            {/* Support Panel */}
            {activeTab === 'support' && (
              <div className="support-panel">
                <div className="support-subtabs">
                  <button 
                    className={`support-subtab-btn ${supportTab === 'tickets' ? 'active' : ''}`}
                    onClick={() => setSupportTab('tickets')}
                  >
                    Support Tickets ({tickets.length})
                  </button>
                  <button 
                    className={`support-subtab-btn ${supportTab === 'complaints' ? 'active' : ''}`}
                    onClick={() => setSupportTab('complaints')}
                  >
                    Complaints ({complaints.length})
                  </button>
                  <button 
                    className={`support-subtab-btn ${supportTab === 'refunds' ? 'active' : ''}`}
                    onClick={() => setSupportTab('refunds')}
                  >
                    Refund Requests ({refunds.length})
                  </button>
                </div>

                <div className="support-items-list">
                  {/* Tickets */}
                  {supportTab === 'tickets' && (
                    tickets.length > 0 ? (
                      tickets.map(ticket => (
                        <div key={ticket.id} className="support-item-card">
                          <div className="support-item-header">
                            <div className="support-item-title">
                              <h3>{ticket.subject}</h3>
                              <div className="support-item-meta">
                                <span>Ticket ID: {ticket.id.slice(0, 8).toUpperCase()}</span>
                                <span>Customer ID: {ticket.user_id?.slice(0, 8) || 'N/A'}</span>
                              </div>
                            </div>
                            <span className={`support-badge ${ticket.status}`}>
                              {ticket.status}
                            </span>
                          </div>
                          
                          <p className="support-description">{ticket.description}</p>
                          
                          {ticket.status === 'open' && (
                            <div className="support-actions-row">
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#16a34a' }}
                                onClick={() => handleUpdateSupportStatus('ticket', ticket.id, 'resolved')}
                                disabled={actionLoadingId === ticket.id}
                              >
                                {actionLoadingId === ticket.id ? 'Loading...' : 'Mark Resolved'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">🎫</span>
                        <h3>No Support Tickets</h3>
                        <p>There are no customer support tickets filed currently.</p>
                      </div>
                    )
                  )}

                  {/* Complaints */}
                  {supportTab === 'complaints' && (
                    complaints.length > 0 ? (
                      complaints.map(complaint => (
                        <div key={complaint.id} className="support-item-card">
                          <div className="support-item-header">
                            <div className="support-item-title">
                              <h3>Complaint: {complaint.issue_type}</h3>
                              <div className="support-item-meta">
                                <span>Complaint ID: {complaint.id.slice(0, 8).toUpperCase()}</span>
                                <span>Order ID: {complaint.order_id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                                <span>Customer ID: {complaint.user_id?.slice(0, 8) || 'N/A'}</span>
                              </div>
                            </div>
                            <span className={`support-badge ${complaint.status}`}>
                              {complaint.status}
                            </span>
                          </div>
                          
                          <p className="support-description">{complaint.description}</p>
                          
                          {complaint.status === 'open' && (
                            <div className="support-actions-row">
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#16a34a' }}
                                onClick={() => handleUpdateSupportStatus('complaint', complaint.id, 'resolved')}
                                disabled={actionLoadingId === complaint.id}
                              >
                                {actionLoadingId === complaint.id ? 'Loading...' : 'Resolve Complaint'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <span className="empty-state-icon">⚠️</span>
                        <h3>No Complaints</h3>
                        <p>There are no customer complaints filed currently.</p>
                      </div>
                    )
                  )}

                  {/* Refunds */}
                  {supportTab === 'refunds' && (
                    refunds.length > 0 ? (
                      refunds.map(refund => (
                        <div key={refund.id} className="support-item-card">
                          <div className="support-item-header">
                            <div className="support-item-title">
                              <h3>Refund Request: ${parseFloat(refund.amount).toFixed(2)}</h3>
                              <div className="support-item-meta">
                                <span>Request ID: {refund.id.slice(0, 8).toUpperCase()}</span>
                                <span>Order ID: {refund.order_id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
                                <span>Customer ID: {refund.user_id?.slice(0, 8) || 'N/A'}</span>
                              </div>
                            </div>
                            <span className={`support-badge ${refund.status}`}>
                              {refund.status}
                            </span>
                          </div>
                          
                          <p className="support-description"><strong>Reason:</strong> {refund.reason}</p>
                          
                          {refund.status === 'Pending' && (
                            <div className="support-actions-row">
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#ef4444' }}
                                onClick={() => handleUpdateSupportStatus('refund', refund.id, 'Rejected')}
                                disabled={actionLoadingId === refund.id}
                              >
                                {actionLoadingId === refund.id ? 'Loading...' : 'Reject Refund'}
                              </button>
                              <button 
                                className="action-btn"
                                style={{ backgroundColor: '#16a34a' }}
                                onClick={() => handleUpdateSupportStatus('refund', refund.id, 'Approved')}
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
                        <p>There are no pending refund requests currently.</p>
                      </div>
                    )
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
